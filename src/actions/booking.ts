"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  bookingStatusesBlockingAvailability,
  computeAvailableSlots,
  type AvailableSlot,
} from "@/lib/availability-slots";
import { overlapsExistingBooking } from "@/lib/booking-overlap";
import {
  getParisWeekdayFromDateString,
  parisDateStringToBounds,
} from "@/lib/paris-time";
import { requireClientUserId } from "@/lib/require-client";
import { prisma } from "@/lib/prisma";

const parisDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide");

const educatorProfileIdSchema = z.string().min(1);

export type EducatorPublicService = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
};

export type EducatorPublicProfile = {
  id: string;
  educatorName: string;
  city: string;
  zipCode: string;
  address: string;
  bio: string | null;
  services: EducatorPublicService[];
};

export type CreateBookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

const getAvailableSlotsSchema = z.object({
  educatorProfileId: educatorProfileIdSchema,
  serviceId: z.string().min(1),
  dateParis: parisDateSchema,
});

const createDogSchema = z.object({
  name: z.string().min(1).max(80),
  breed: z.string().max(80).optional(),
  age: z.coerce.number().int().min(0).max(30).optional(),
});

const createBookingSchema = z.object({
  educatorProfileId: educatorProfileIdSchema,
  serviceId: z.string().min(1),
  dogId: z.string().min(1),
  slotStartUtcIso: z.string().min(1),
});

export async function getEducatorPublicProfile(
  educatorProfileId: unknown,
): Promise<ActionResult<EducatorPublicProfile>> {
  const parsed = educatorProfileIdSchema.safeParse(educatorProfileId);
  if (!parsed.success) {
    return { success: false, error: "Profil invalide." };
  }

  try {
    const profile = await prisma.educatorProfile.findUnique({
      where: { id: parsed.data },
      select: {
        id: true,
        city: true,
        zipCode: true,
        address: true,
        bio: true,
        user: { select: { name: true } },
        services: {
          where: { isActive: true },
          orderBy: { title: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            durationMinutes: true,
            price: true,
          },
        },
      },
    });

    if (!profile) {
      return { success: false, error: "Éducateur introuvable." };
    }

    return {
      success: true,
      data: {
        id: profile.id,
        educatorName: profile.user.name,
        city: profile.city,
        zipCode: profile.zipCode,
        address: profile.address,
        bio: profile.bio,
        services: profile.services.map((service) => ({
          id: service.id,
          title: service.title,
          description: service.description,
          durationMinutes: service.durationMinutes,
          priceCents: service.price,
        })),
      },
    };
  } catch {
    return { success: false, error: "Erreur serveur." };
  }
}

export async function getAvailableSlots(
  input: unknown,
): Promise<ActionResult<AvailableSlot[]>> {
  const parsed = getAvailableSlotsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Paramètres invalides." };
  }

  const { educatorProfileId, serviceId, dateParis } = parsed.data;

  try {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, educatorProfileId, isActive: true },
      select: { durationMinutes: true },
    });

    if (!service) {
      return { success: false, error: "Service introuvable." };
    }

    const dayOfWeek = getParisWeekdayFromDateString(dateParis);
    const { startUtc, endUtc } = parisDateStringToBounds(dateParis);

    const [availabilities, bookings] = await Promise.all([
      prisma.availability.findMany({
        where: {
          educatorProfileId,
          dayOfWeek,
          isActive: true,
        },
        select: { startTime: true, endTime: true },
      }),
      prisma.booking.findMany({
        where: {
          educatorProfileId,
          status: { in: bookingStatusesBlockingAvailability() },
          dateTime: { gte: startUtc, lte: endUtc },
        },
        select: {
          dateTime: true,
          service: { select: { durationMinutes: true } },
        },
      }),
    ]);

    const slots = computeAvailableSlots({
      dateStr: dateParis,
      durationMinutes: service.durationMinutes,
      availabilities,
      bookings,
    });

    return { success: true, data: slots };
  } catch {
    return { success: false, error: "Erreur serveur." };
  }
}

export type ClientDogItem = {
  id: string;
  name: string;
  breed: string | null;
};

export async function getMyDogs(): Promise<ActionResult<ClientDogItem[]>> {
  const client = await requireClientUserId();
  if (!client.success) {
    return client;
  }

  try {
    const dogs = await prisma.dog.findMany({
      where: { userId: client.data.userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, breed: true },
    });
    return { success: true, data: dogs };
  } catch {
    return { success: false, error: "Erreur serveur." };
  }
}

export async function createDog(
  input: unknown,
): Promise<ActionResult<ClientDogItem>> {
  const client = await requireClientUserId();
  if (!client.success) {
    return client;
  }

  const parsed = createDogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations du chien invalides." };
  }

  try {
    const dog = await prisma.dog.create({
      data: {
        userId: client.data.userId,
        name: parsed.data.name,
        breed: parsed.data.breed ?? null,
        age: parsed.data.age ?? null,
      },
      select: { id: true, name: true, breed: true },
    });
    revalidatePath("/account/chiens");
    return { success: true, data: dog };
  } catch {
    return { success: false, error: "Erreur serveur." };
  }
}

export async function createBooking(
  input: unknown,
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données de réservation invalides." };
  }

  const client = await requireClientUserId();
  if (!client.success) {
    return { success: false, error: client.error };
  }

  const { educatorProfileId, serviceId, dogId, slotStartUtcIso } = parsed.data;
  const slotStart = new Date(slotStartUtcIso);

  if (Number.isNaN(slotStart.getTime())) {
    return { success: false, error: "Créneau invalide." };
  }

  try {
    const dog = await prisma.dog.findFirst({
      where: { id: dogId, userId: client.data.userId },
      select: { id: true },
    });
    if (!dog) {
      return { success: false, error: "Chien introuvable." };
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, educatorProfileId, isActive: true },
      select: { id: true, durationMinutes: true },
    });
    if (!service) {
      return { success: false, error: "Service introuvable." };
    }

    const dateParis = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(slotStart);

    const booking = await prisma.$transaction(async (tx) => {
      const slotsResult = await getAvailableSlots({
        educatorProfileId,
        serviceId,
        dateParis,
      });

      if (!slotsResult.success) {
        throw new Error(slotsResult.error);
      }

      const stillAvailable = slotsResult.data.some(
        (slot) => slot.startUtcIso === slotStart.toISOString(),
      );

      if (!stillAvailable) {
        throw new Error(
          "SLOT_UNAVAILABLE:Ce créneau n’est plus disponible. Choisissez un autre horaire.",
        );
      }

      const { startUtc, endUtc } = parisDateStringToBounds(dateParis);
      const blocking = await tx.booking.findMany({
        where: {
          educatorProfileId,
          status: { in: bookingStatusesBlockingAvailability() },
          dateTime: { gte: startUtc, lte: endUtc },
        },
        include: { service: { select: { durationMinutes: true } } },
      });

      if (
        overlapsExistingBooking(
          slotStart,
          service.durationMinutes,
          blocking,
        )
      ) {
        throw new Error(
          "SLOT_UNAVAILABLE:Ce créneau vient d’être réservé. Choisissez un autre horaire.",
        );
      }

      return tx.booking.create({
        data: {
          userId: client.data.userId,
          dogId,
          serviceId,
          educatorProfileId,
          dateTime: slotStart,
          status: BookingStatus.PENDING,
        },
        select: { id: true },
      });
    });

    revalidatePath("/dashboard/chiens");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/seances");
    revalidatePath("/account");

    return { success: true, bookingId: booking.id };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("SLOT_UNAVAILABLE:")) {
        return {
          success: false,
          error: error.message.slice("SLOT_UNAVAILABLE:".length),
        };
      }
      if (
        error.message !== "Erreur serveur." &&
        !error.message.includes("Prisma")
      ) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: "Erreur serveur." };
  }
}
