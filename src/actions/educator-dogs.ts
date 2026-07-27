"use server";

import { z } from "zod";

import type { Booking, Dog, Service, User } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  formatTimeParis,
  toParisDateString,
} from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type {
  EducatorDogDetail,
  EducatorDogListItem,
  EducatorDogSessionItem,
} from "@/types/educator-dog";

const dogIdSchema = z.object({
  dogId: z.string().min(1),
});

type BookingWithRelations = Booking & {
  dog: Dog;
  service: Service;
  client: Pick<User, "name" | "email">;
};

function buildListItem(
  dog: Dog,
  ownerName: string,
  bookings: BookingWithRelations[],
): EducatorDogListItem {
  const nonCancelled = bookings.filter((b) => b.status !== "CANCELLED");
  const relevant = nonCancelled.length > 0 ? nonCancelled : bookings;
  const sorted = [...relevant].sort(
    (a, b) => b.dateTime.getTime() - a.dateTime.getTime(),
  );
  const last = sorted[0];
  const reportsCount = bookings.filter(
    (b) => b.postSessionReport && b.postSessionReport.trim().length > 0,
  ).length;

  return {
    id: dog.id,
    name: dog.name,
    breed: dog.breed,
    age: dog.age,
    ownerName,
    sessionsCount: bookings.filter((b) => b.status !== "CANCELLED").length,
    lastSessionDateParis: last ? toParisDateString(last.dateTime) : null,
    reportsCount,
  };
}

function mapSession(row: BookingWithRelations): EducatorDogSessionItem {
  return {
    bookingId: row.id,
    dateParis: toParisDateString(row.dateTime),
    timeParis: formatTimeParis(row.dateTime),
    serviceTitle: row.service.title,
    status: row.status,
    postSessionReport: row.postSessionReport,
  };
}

export async function getEducatorDogsCount(): Promise<ActionResult<number>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const rows = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        status: { not: "CANCELLED" },
      },
      distinct: ["dogId"],
      select: { dogId: true },
    });
    return { success: true, data: rows.length };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de compter les chiens.",
    };
  }
}

export async function listEducatorDogs(): Promise<
  ActionResult<EducatorDogListItem[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const bookings = await prisma.booking.findMany({
      where: { educatorProfileId: educator.data.educatorProfileId },
      include: {
        dog: true,
        service: true,
        client: { select: { name: true, email: true } },
      },
      orderBy: { dateTime: "desc" },
    });

    const byDog = new Map<
      string,
      { dog: Dog; ownerName: string; bookings: BookingWithRelations[] }
    >();

    for (const row of bookings) {
      const existing = byDog.get(row.dogId);
      if (existing) {
        existing.bookings.push(row);
      } else {
        byDog.set(row.dogId, {
          dog: row.dog,
          ownerName: row.client.name,
          bookings: [row],
        });
      }
    }

    const items = [...byDog.values()]
      .filter(({ bookings: dogBookings }) =>
        dogBookings.some((b) => b.status !== "CANCELLED"),
      )
      .map(({ dog, ownerName, bookings: dogBookings }) =>
        buildListItem(dog, ownerName, dogBookings),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    return { success: true, data: items };
  } catch (error) {
    console.error("[listEducatorDogs]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger les chiens.",
    };
  }
}

export async function getEducatorDogById(
  input: unknown,
): Promise<ActionResult<EducatorDogDetail>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = dogIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identifiant invalide." };
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        dogId: parsed.data.dogId,
        educatorProfileId: educator.data.educatorProfileId,
      },
      include: {
        dog: true,
        service: true,
        client: { select: { name: true, email: true } },
      },
      orderBy: { dateTime: "desc" },
    });

    if (bookings.length === 0) {
      return { success: false, error: "Chien introuvable ou accès refusé." };
    }

    const dog = bookings[0].dog;
    const client = bookings[0].client;

    return {
      success: true,
      data: {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        behavioralNotes: dog.behavioralNotes,
        medicalNotes: dog.medicalNotes,
        ownerName: client.name,
        ownerEmail: client.email,
        sessions: bookings.map(mapSession),
      },
    };
  } catch (error) {
    console.error("[getEducatorDogById]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger la fiche chien.",
    };
  }
}
