"use server";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { formatParisRelativeSessionLabel } from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type { EducatorClientItem } from "@/types/educator-client";

export async function getEducatorClients(): Promise<
  ActionResult<EducatorClientItem[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        status: { not: BookingStatus.CANCELLED },
      },
      include: {
        dog: { select: { id: true, name: true, breed: true } },
        service: { select: { title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dateTime: "desc" },
    });

    const now = Date.now();
    const byDog = new Map<
      string,
      {
        clientId: string;
        ownerName: string;
        email: string | null;
        dogId: string;
        dogName: string;
        breed: string | null;
        completed: number;
        total: number;
        latestService: string;
        nextFuture: Date | null;
        nextBookingId: string | null;
        nextService: string | null;
      }
    >();

    for (const booking of bookings) {
      let row = byDog.get(booking.dogId);
      if (!row) {
        row = {
          clientId: booking.client.id,
          ownerName: booking.client.name,
          email: booking.client.email,
          dogId: booking.dog.id,
          dogName: booking.dog.name,
          breed: booking.dog.breed,
          completed: 0,
          total: 0,
          latestService: booking.service.title,
          nextFuture: null,
          nextBookingId: null,
          nextService: null,
        };
        byDog.set(booking.dogId, row);
      }

      row.total += 1;
      if (booking.status === BookingStatus.COMPLETED) {
        row.completed += 1;
      }

      const isUpcoming =
        booking.dateTime.getTime() >= now &&
        booking.status !== BookingStatus.COMPLETED;

      if (
        isUpcoming &&
        (!row.nextFuture ||
          booking.dateTime.getTime() < row.nextFuture.getTime())
      ) {
        row.nextFuture = booking.dateTime;
        row.nextBookingId = booking.id;
        row.nextService = booking.service.title;
      }
    }

    const items: EducatorClientItem[] = Array.from(byDog.values()).map(
      (row) => {
        const progress =
          row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;

        return {
          id: `${row.clientId}:${row.dogId}`,
          ownerName: row.ownerName,
          email: row.email,
          dogId: row.dogId,
          dogName: row.dogName,
          breed: row.breed,
          program: row.nextService ?? row.latestService,
          completedSessions: row.completed,
          totalSessions: row.total,
          progress,
          nextSessionLabel: row.nextFuture
            ? formatParisRelativeSessionLabel(row.nextFuture)
            : row.completed > 0
              ? "Terminé"
              : "—",
          nextSessionHref: row.nextBookingId
            ? `/dashboard/seances/${row.nextBookingId}`
            : `/dashboard/chiens/${row.dogId}`,
        };
      },
    );

    items.sort((a, b) => {
      const aDone = a.nextSessionLabel === "—" || a.nextSessionLabel === "Terminé";
      const bDone = b.nextSessionLabel === "—" || b.nextSessionLabel === "Terminé";
      if (aDone !== bDone) return aDone ? 1 : -1;
      return a.ownerName.localeCompare(b.ownerName, "fr");
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("[getEducatorClients]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger les clients.",
    };
  }
}
