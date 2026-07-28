"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BookingStatus, Role } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  assertEducatorSlotAvailable,
  slotUnavailableMessage,
} from "@/lib/booking-slot-guard";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type { EducatorManualBookingClient } from "@/types/educator-manual-booking";

const slotStartSchema = z.string().min(1);

const bookingBaseSchema = z.object({
  serviceId: z.string().min(1),
  slotStartUtcIso: slotStartSchema,
});

const existingClientBookingSchema = bookingBaseSchema.extend({
  mode: z.literal("existing"),
  clientUserId: z.string().min(1),
  dogId: z.string().min(1),
});

const newClientBookingSchema = bookingBaseSchema.extend({
  mode: z.literal("new"),
  ownerName: z.string().trim().min(1, "Nom du client obligatoire.").max(120),
  email: z.string().trim().email("E-mail invalide."),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => v || undefined),
  dogName: z.string().trim().min(1, "Nom du chien obligatoire.").max(80),
  dogBreed: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => v || undefined),
});

const createEducatorManualBookingSchema = z.discriminatedUnion("mode", [
  existingClientBookingSchema,
  newClientBookingSchema,
]);

function revalidateBookingViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/chiens");
  revalidatePath("/dashboard/clients");
}

export async function listEducatorManualBookingClients(): Promise<
  ActionResult<EducatorManualBookingClient[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const bookings = await prisma.booking.findMany({
      where: { educatorProfileId: educator.data.educatorProfileId },
      orderBy: { dateTime: "desc" },
      select: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        dog: {
          select: { id: true, name: true, breed: true },
        },
      },
    });

    const byUserId = new Map<string, EducatorManualBookingClient>();

    for (const row of bookings) {
      const client = row.client;
      let entry = byUserId.get(client.id);
      if (!entry) {
        entry = {
          userId: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          dogs: [],
        };
        byUserId.set(client.id, entry);
      }
      if (!entry.dogs.some((d) => d.id === row.dog.id)) {
        entry.dogs.push({
          id: row.dog.id,
          name: row.dog.name,
          breed: row.dog.breed,
        });
      }
    }

    const userIds = [...byUserId.keys()];
    if (userIds.length > 0) {
      const allDogs = await prisma.dog.findMany({
        where: { userId: { in: userIds } },
        orderBy: { name: "asc" },
        select: { id: true, name: true, breed: true, userId: true },
      });
      for (const dog of allDogs) {
        const entry = byUserId.get(dog.userId);
        if (!entry) continue;
        if (!entry.dogs.some((d) => d.id === dog.id)) {
          entry.dogs.push({
            id: dog.id,
            name: dog.name,
            breed: dog.breed,
          });
        }
      }
    }

    const clients = [...byUserId.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    );

    return { success: true, data: clients };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger la liste des clients.",
    };
  }
}

async function resolveClientAndDog(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  educatorProfileId: string,
  parsed: z.infer<typeof createEducatorManualBookingSchema>,
): Promise<{ userId: string; dogId: string }> {
  if (parsed.mode === "existing") {
    const prior = await tx.booking.findFirst({
      where: {
        educatorProfileId,
        userId: parsed.clientUserId,
      },
      select: { id: true },
    });
    if (!prior) {
      throw new Error("CLIENT_UNKNOWN:Client introuvable dans votre historique.");
    }

    const dog = await tx.dog.findFirst({
      where: { id: parsed.dogId, userId: parsed.clientUserId },
      select: { id: true },
    });
    if (!dog) {
      throw new Error("CLIENT_UNKNOWN:Chien introuvable pour ce client.");
    }

    return { userId: parsed.clientUserId, dogId: parsed.dogId };
  }

  const email = parsed.email.toLowerCase();
  const existingUser = await tx.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existingUser) {
    if (existingUser.role !== Role.CLIENT) {
      throw new Error(
        "CLIENT_UNKNOWN:Cet e-mail est déjà utilisé par un autre type de compte.",
      );
    }
    const dog = await tx.dog.create({
      data: {
        userId: existingUser.id,
        name: parsed.dogName,
        breed: parsed.dogBreed ?? null,
      },
      select: { id: true },
    });
    return { userId: existingUser.id, dogId: dog.id };
  }

  const user = await tx.user.create({
    data: {
      clerkId: `manual_${randomUUID()}`,
      email,
      name: parsed.ownerName,
      phone: parsed.phone ?? null,
      role: Role.CLIENT,
    },
    select: { id: true },
  });

  const dog = await tx.dog.create({
    data: {
      userId: user.id,
      name: parsed.dogName,
      breed: parsed.dogBreed ?? null,
    },
    select: { id: true },
  });

  return { userId: user.id, dogId: dog.id };
}

export async function createEducatorManualBooking(
  input: unknown,
): Promise<ActionResult<{ bookingId: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = createEducatorManualBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const slotStart = new Date(parsed.data.slotStartUtcIso);
  if (Number.isNaN(slotStart.getTime())) {
    return { success: false, error: "Créneau invalide." };
  }

  const educatorProfileId = educator.data.educatorProfileId;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findFirst({
        where: {
          id: parsed.data.serviceId,
          educatorProfileId,
          isActive: true,
        },
        select: { id: true, durationMinutes: true },
      });
      if (!service) {
        throw new Error("SERVICE_MISSING:Service introuvable ou inactif.");
      }

      const { userId, dogId } = await resolveClientAndDog(
        tx,
        educatorProfileId,
        parsed.data,
      );

      await assertEducatorSlotAvailable(tx, {
        educatorProfileId,
        serviceId: service.id,
        slotStart,
        durationMinutes: service.durationMinutes,
      });

      return tx.booking.create({
        data: {
          userId,
          dogId,
          serviceId: service.id,
          educatorProfileId,
          dateTime: slotStart,
          status: BookingStatus.CONFIRMED,
        },
        select: { id: true },
      });
    });

    revalidateBookingViews();
    return { success: true, data: { bookingId: booking.id } };
  } catch (error) {
    const slotMsg = slotUnavailableMessage(error);
    if (slotMsg) {
      return { success: false, error: slotMsg };
    }
    if (error instanceof Error) {
      if (error.message.startsWith("CLIENT_UNKNOWN:")) {
        return {
          success: false,
          error: error.message.slice("CLIENT_UNKNOWN:".length),
        };
      }
      if (error.message.startsWith("SERVICE_MISSING:")) {
        return {
          success: false,
          error: error.message.slice("SERVICE_MISSING:".length),
        };
      }
    }
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de créer la réservation.",
    };
  }
}

export async function getEducatorManualBookingFormData(): Promise<
  ActionResult<{
    educatorProfileId: string;
    services: {
      id: string;
      title: string;
      durationMinutes: number;
      priceCents: number;
      isActive: boolean;
    }[];
    clients: EducatorManualBookingClient[];
  }>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const [services, clientsResult] = await Promise.all([
      prisma.service.findMany({
        where: { educatorProfileId: educator.data.educatorProfileId },
        orderBy: [{ isActive: "desc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
          isActive: true,
        },
      }),
      listEducatorManualBookingClients(),
    ]);

    if (!clientsResult.success) {
      return clientsResult;
    }

    return {
      success: true,
      data: {
        educatorProfileId: educator.data.educatorProfileId,
        services: services.map((s) => ({
          id: s.id,
          title: s.title,
          durationMinutes: s.durationMinutes,
          priceCents: s.price,
          isActive: s.isActive,
        })),
        clients: clientsResult.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger le formulaire.",
    };
  }
}
