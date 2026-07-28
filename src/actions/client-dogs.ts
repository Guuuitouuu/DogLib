"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  formatTimeParis,
  toParisDateString,
} from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireClientUserId } from "@/lib/require-client";
import { prisma } from "@/lib/prisma";
import type {
  ClientDashboardSummary,
  ClientDogDetail,
  ClientDogListItem,
  ClientDogReservationItem,
} from "@/types/client-dashboard";

const dogIdSchema = z.object({ dogId: z.string().min(1) });

const photoUrlSchema = z
  .string()
  .max(2048)
  .optional()
  .refine(
    (value) => {
      if (value === undefined || value === "") return true;
      return value.startsWith("/") || /^https?:\/\//i.test(value);
    },
    { message: "URL de photo invalide." },
  );

const createDogSchema = z.object({
  name: z.string().min(1).max(80),
  breed: z.string().max(80).optional(),
  age: z.coerce.number().int().min(0).max(30).optional(),
  behavioralNotes: z.string().max(5000).optional(),
  medicalNotes: z.string().max(5000).optional(),
  photoUrl: photoUrlSchema,
});

const updateDogSchema = createDogSchema.extend({
  dogId: z.string().min(1),
});

function mapReservation(row: {
  id: string;
  dateTime: Date;
  status: BookingStatus;
  postSessionReport: string | null;
  service: { title: string };
  educator: { id: string; user: { name: string } };
}): ClientDogReservationItem {
  return {
    bookingId: row.id,
    dateParis: toParisDateString(row.dateTime),
    timeParis: formatTimeParis(row.dateTime),
    serviceTitle: row.service.title,
    educatorName: row.educator.user.name,
    educatorProfileId: row.educator.id,
    status: row.status,
    postSessionReport: row.postSessionReport,
  };
}

export async function getClientDashboardSummary(): Promise<
  ActionResult<ClientDashboardSummary>
> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  try {
    const [dogsCount, bookings] = await Promise.all([
      prisma.dog.count({ where: { userId: client.data.userId } }),
      prisma.booking.findMany({
        where: {
          userId: client.data.userId,
          status: { not: BookingStatus.CANCELLED },
        },
        select: {
          status: true,
          postSessionReport: true,
        },
      }),
    ]);

    const completedReservations = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    ).length;
    const reportsCount = bookings.filter(
      (b) => b.postSessionReport && b.postSessionReport.trim().length > 0,
    ).length;

    return {
      success: true,
      data: {
        dogsCount,
        totalReservations: bookings.length,
        completedReservations,
        reportsCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger le résumé.",
    };
  }
}

export async function listClientDogs(): Promise<
  ActionResult<ClientDogListItem[]>
> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  try {
    const dogs = await prisma.dog.findMany({
      where: { userId: client.data.userId },
      orderBy: { name: "asc" },
      include: {
        bookings: {
          where: { status: { not: BookingStatus.CANCELLED } },
          select: { postSessionReport: true },
        },
      },
    });

    const items: ClientDogListItem[] = dogs.map((dog) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      photoUrl: dog.photoUrl,
      reservationsCount: dog.bookings.length,
      reportsCount: dog.bookings.filter(
        (b) => b.postSessionReport && b.postSessionReport.trim().length > 0,
      ).length,
    }));

    return { success: true, data: items };
  } catch (error) {
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Impossible de charger les chiens.",
    };
  }
}

export async function getClientDogById(
  input: unknown,
): Promise<ActionResult<ClientDogDetail>> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  const parsed = dogIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Chien introuvable." };
  }

  try {
    const dog = await prisma.dog.findFirst({
      where: { id: parsed.data.dogId, userId: client.data.userId },
      include: {
        bookings: {
          orderBy: { dateTime: "desc" },
          include: {
            service: { select: { title: true } },
            educator: {
              select: { id: true, user: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!dog) {
      return { success: false, error: "Chien introuvable." };
    }

    const nonCancelled = dog.bookings.filter(
      (b) => b.status !== BookingStatus.CANCELLED,
    );
    const completed = nonCancelled.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    );

    return {
      success: true,
      data: {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        photoUrl: dog.photoUrl,
        behavioralNotes: dog.behavioralNotes,
        medicalNotes: dog.medicalNotes,
        reservationsCount: nonCancelled.length,
        completedReservationsCount: completed.length,
        reservations: dog.bookings.map(mapReservation),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger la fiche chien.",
    };
  }
}

export async function createClientDog(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string; breed: string | null }>> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  const parsed = createDogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations du chien invalides." };
  }

  try {
    const dog = await prisma.dog.create({
      data: {
        userId: client.data.userId,
        name: parsed.data.name.trim(),
        breed: parsed.data.breed?.trim() || null,
        age: parsed.data.age ?? null,
        behavioralNotes: parsed.data.behavioralNotes?.trim() || null,
        medicalNotes: parsed.data.medicalNotes?.trim() || null,
        photoUrl: parsed.data.photoUrl?.trim() || null,
      },
      select: { id: true, name: true, breed: true },
    });

    revalidatePath("/account");
    revalidatePath("/account/chiens");

    return { success: true, data: dog };
  } catch (error) {
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Erreur serveur.",
    };
  }
}

export async function updateClientDog(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  const parsed = updateDogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations du chien invalides." };
  }

  try {
    const existing = await prisma.dog.findFirst({
      where: { id: parsed.data.dogId, userId: client.data.userId },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: "Chien introuvable." };
    }

    await prisma.dog.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name.trim(),
        breed: parsed.data.breed?.trim() || null,
        age: parsed.data.age ?? null,
        behavioralNotes: parsed.data.behavioralNotes?.trim() || null,
        medicalNotes: parsed.data.medicalNotes?.trim() || null,
        photoUrl: parsed.data.photoUrl?.trim() || null,
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/chiens");
    revalidatePath(`/account/chiens/${existing.id}`);
    revalidatePath(`/account/chiens/${existing.id}/comptes-rendus`);

    return { success: true, data: { id: existing.id } };
  } catch (error) {
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Erreur serveur.",
    };
  }
}
