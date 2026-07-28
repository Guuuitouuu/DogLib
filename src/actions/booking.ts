"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  bookingStatusesBlockingAvailability,
  computeAvailableSlots,
  type AvailableSlot,
} from "@/lib/availability-slots";
import {
  assertEducatorSlotAvailable,
  slotUnavailableMessage,
} from "@/lib/booking-slot-guard";
import {
  getParisWeekdayFromDateString,
  parisDateStringToBounds,
} from "@/lib/paris-time";
import { requireClientUserId } from "@/lib/require-client";
import {
  notifyEducatorBookingRequest,
} from "@/lib/educator-notification-create";
import { prismaErrorMessage } from "@/lib/prisma-errors";
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

export type EducatorPublicDogItem = {
  id: string;
  name: string;
  breed: string | null;
  photoUrl: string | null;
};

export type EducatorPublicProfile = {
  id: string;
  educatorName: string;
  city: string;
  zipCode: string;
  address: string;
  bio: string | null;
  lat: number;
  lng: number;
  bannerUrl: string | null;
  profilePhotoUrl: string | null;
  clerkPhotoUrl: string | null;
  galleryUrls: string[];
  showLocationMap: boolean;
  personalDogs: EducatorPublicDogItem[];
  educatedDogs: EducatorPublicDogItem[];
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
        lat: true,
        lng: true,
        bannerUrl: true,
        profilePhotoUrl: true,
        galleryUrls: true,
        showLocationMap: true,
        userId: true,
        user: { select: { name: true, clerkId: true } },
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

    const [clerkPhotoUrl, personalDogs, educatedDogRows] = await Promise.all([
      (async (): Promise<string | null> => {
        try {
          const clerkUser = await (
            await clerkClient()
          ).users.getUser(profile.user.clerkId);
          return clerkUser.hasImage ? clerkUser.imageUrl : null;
        } catch {
          return null;
        }
      })(),
      prisma.dog.findMany({
        where: { userId: profile.userId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, breed: true, photoUrl: true },
      }),
      prisma.booking.findMany({
        where: {
          educatorProfileId: profile.id,
          status: { not: "CANCELLED" },
        },
        select: {
          dog: {
            select: { id: true, name: true, breed: true, photoUrl: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const personalDogIds = new Set(personalDogs.map((d) => d.id));
    const seenEducated = new Set<string>();
    const educatedDogs: typeof personalDogs = [];
    for (const row of educatedDogRows) {
      const dog = row.dog;
      if (personalDogIds.has(dog.id) || seenEducated.has(dog.id)) continue;
      seenEducated.add(dog.id);
      educatedDogs.push(dog);
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
        lat: profile.lat,
        lng: profile.lng,
        bannerUrl: profile.bannerUrl,
        profilePhotoUrl: profile.profilePhotoUrl,
        clerkPhotoUrl,
        galleryUrls: profile.galleryUrls,
        showLocationMap: profile.showLocationMap,
        personalDogs,
        educatedDogs,
        services: profile.services.map((service) => ({
          id: service.id,
          title: service.title,
          description: service.description,
          durationMinutes: service.durationMinutes,
          priceCents: service.price,
        })),
      },
    };
  } catch (error) {
    console.error("[getEducatorPublicProfile]", error);
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Erreur serveur.",
    };
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

    const booking = await prisma.$transaction(async (tx) => {
      await assertEducatorSlotAvailable(tx, {
        educatorProfileId,
        serviceId: service.id,
        slotStart,
        durationMinutes: service.durationMinutes,
      });

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

    const details = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        client: { select: { name: true } },
        dog: { select: { name: true } },
        service: { select: { title: true } },
      },
    });

    if (details) {
      await notifyEducatorBookingRequest({
        educatorProfileId,
        bookingId: details.id,
        clientName: details.client.name,
        dogName: details.dog.name,
        serviceTitle: details.service.title,
        dateTime: details.dateTime,
      });
    }

    revalidatePath("/dashboard/chiens");
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/reservations");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/account");

    return { success: true, bookingId: booking.id };
  } catch (error) {
    const slotMsg = slotUnavailableMessage(error);
    if (slotMsg) {
      return { success: false, error: slotMsg };
    }
    if (error instanceof Error) {
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
