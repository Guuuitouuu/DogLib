"use server";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { formatTimeParis, toParisDateString } from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type { EducatorClientListItem } from "@/types/educator-client";

type BookingForClient = {
  dateTime: Date;
  status: BookingStatus;
  dogId: string;
  userId: string;
  dog: { id: string; name: string; breed: string | null };
  service: { title: string };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

function buildClientRows(bookings: BookingForClient[]): EducatorClientListItem[] {
  const now = Date.now();
  const byDog = new Map<
    string,
    {
      meta: BookingForClient;
      rows: BookingForClient[];
    }
  >();

  for (const row of bookings) {
    let group = byDog.get(row.dogId);
    if (!group) {
      group = { meta: row, rows: [] };
      byDog.set(row.dogId, group);
    }
    group.rows.push(row);
  }

  const items: EducatorClientListItem[] = [];

  for (const [dogId, group] of byDog) {
    const sorted = [...group.rows].sort(
      (a, b) => b.dateTime.getTime() - a.dateTime.getTime(),
    );
    const meta = group.meta;
    const nonCancelled = sorted.filter((b) => b.status !== BookingStatus.CANCELLED);
    const completed = nonCancelled.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    );
    const upcoming = nonCancelled
      .filter(
        (b) =>
          b.dateTime.getTime() >= now &&
          (b.status === BookingStatus.PENDING ||
            b.status === BookingStatus.CONFIRMED),
      )
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())[0];

    const reservationsCount = nonCancelled.length;
    const completedReservationsCount = completed.length;
    const completionPercent =
      reservationsCount > 0
        ? Math.round((completedReservationsCount / reservationsCount) * 100)
        : 0;

    items.push({
      id: dogId,
      dogId,
      clientUserId: meta.client.id,
      ownerName: meta.client.name,
      email: meta.client.email,
      phone: meta.client.phone,
      dogName: meta.dog.name,
      breed: meta.dog.breed,
      lastServiceTitle: nonCancelled[0]?.service.title ?? null,
      reservationsCount,
      completedReservationsCount,
      completionPercent,
      nextBookingDateParis: upcoming
        ? toParisDateString(upcoming.dateTime)
        : null,
      nextBookingTimeParis: upcoming ? formatTimeParis(upcoming.dateTime) : null,
      nextBookingStatus: upcoming?.status ?? null,
    });
  }

  return items.sort((a, b) => {
    const aTime = a.nextBookingDateParis
      ? new Date(`${a.nextBookingDateParis}T12:00:00Z`).getTime()
      : 0;
    const bTime = b.nextBookingDateParis
      ? new Date(`${b.nextBookingDateParis}T12:00:00Z`).getTime()
      : 0;
    if (aTime !== bTime) {
      if (!a.nextBookingDateParis) return 1;
      if (!b.nextBookingDateParis) return -1;
      return aTime - bTime;
    }
    return a.ownerName.localeCompare(b.ownerName, "fr");
  });
}

export async function listEducatorClients(): Promise<
  ActionResult<EducatorClientListItem[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const bookings = await prisma.booking.findMany({
      where: { educatorProfileId: educator.data.educatorProfileId },
      orderBy: { dateTime: "desc" },
      select: {
        dateTime: true,
        status: true,
        dogId: true,
        userId: true,
        dog: { select: { id: true, name: true, breed: true } },
        service: { select: { title: true } },
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return { success: true, data: buildClientRows(bookings) };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger vos clients.",
    };
  }
}

export async function getEducatorClientsCount(): Promise<ActionResult<number>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const rows = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        status: { not: BookingStatus.CANCELLED },
      },
      distinct: ["userId"],
      select: { userId: true },
    });
    return { success: true, data: rows.length };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de compter les clients.",
    };
  }
}
