"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  clientCanCancelBooking,
  clientCancelBlockedMessage,
} from "@/lib/client-booking-policy";
import {
  formatTimeParis,
  toParisDateString,
} from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireClientUserId } from "@/lib/require-client";
import { prisma } from "@/lib/prisma";
import type {
  ClientBookingItem,
  ClientBookingsOverview,
} from "@/types/client-dashboard";

const bookingIdSchema = z.object({
  bookingId: z.string().min(1),
});

function formatLocation(row: {
  address: string;
  city: string;
  zipCode: string;
}): string {
  return `${row.address}, ${row.zipCode} ${row.city}`;
}

function mapBooking(row: {
  id: string;
  dateTime: Date;
  status: BookingStatus;
  postSessionReport: string | null;
  dog: { id: string; name: string };
  service: { title: string; durationMinutes: number; price: number };
  educator: {
    id: string;
    address: string;
    city: string;
    zipCode: string;
    user: { name: string };
  };
}): ClientBookingItem {
  const now = new Date();
  const isUpcoming =
    (row.status === BookingStatus.PENDING ||
      row.status === BookingStatus.CONFIRMED) &&
    row.dateTime > now;

  let canCancel = false;
  let cancelBlockedReason: string | null = null;
  if (isUpcoming) {
    if (clientCanCancelBooking(row.dateTime, now)) {
      canCancel = true;
    } else {
      cancelBlockedReason = clientCancelBlockedMessage();
    }
  }

  return {
    id: row.id,
    status: row.status,
    dateParis: toParisDateString(row.dateTime),
    timeParis: formatTimeParis(row.dateTime),
    durationMinutes: row.service.durationMinutes,
    serviceTitle: row.service.title,
    priceCents: row.service.price,
    dogName: row.dog.name,
    dogId: row.dog.id,
    educatorName: row.educator.user.name,
    educatorProfileId: row.educator.id,
    location: formatLocation(row.educator),
    postSessionReport: row.postSessionReport,
    canCancel,
    cancelBlockedReason,
  };
}

export async function getClientBookingsOverview(): Promise<
  ActionResult<ClientBookingsOverview>
> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  try {
    const rows = await prisma.booking.findMany({
      where: { userId: client.data.userId },
      orderBy: { dateTime: "desc" },
      include: {
        dog: { select: { id: true, name: true } },
        service: {
          select: { title: true, durationMinutes: true, price: true },
        },
        educator: {
          select: {
            id: true,
            address: true,
            city: true,
            zipCode: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    const now = new Date();
    const upcomingRows = rows
      .filter(
        (row) =>
          (row.status === BookingStatus.PENDING ||
            row.status === BookingStatus.CONFIRMED) &&
          row.dateTime > now,
      )
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    const upcomingIds = new Set(upcomingRows.map((r) => r.id));
    const upcoming = upcomingRows.map(mapBooking);
    const past = rows.filter((r) => !upcomingIds.has(r.id)).map(mapBooking);

    return {
      success: true,
      data: { upcoming, past },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger vos rendez-vous.",
    };
  }
}

export async function cancelClientBooking(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  const parsed = bookingIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Rendez-vous introuvable." };
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: parsed.data.bookingId,
        userId: client.data.userId,
      },
      select: { id: true, dateTime: true, status: true },
    });

    if (!booking) {
      return { success: false, error: "Rendez-vous introuvable." };
    }

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      return {
        success: false,
        error: "Ce rendez-vous ne peut plus être annulé.",
      };
    }

    if (booking.dateTime <= new Date()) {
      return {
        success: false,
        error: "Ce rendez-vous a déjà commencé ou est passé.",
      };
    }

    if (!clientCanCancelBooking(booking.dateTime)) {
      return { success: false, error: clientCancelBlockedMessage() };
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED },
    });

    revalidatePath("/account");
    revalidatePath("/account/chiens");
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/seances");

    return { success: true, data: { id: booking.id } };
  } catch (error) {
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Erreur serveur.",
    };
  }
}
