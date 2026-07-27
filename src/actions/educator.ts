"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  BookingStatus,
  type Booking,
  type Dog,
  type Service,
  type User,
} from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  formatTimeParis,
  getParisDayBoundsUtc,
  getParisMonthToTodayBoundsUtc,
} from "@/lib/paris-time";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";

export type TodayBookingItem = {
  id: string;
  time: string;
  dogName: string;
  ownerName: string;
  serviceTitle: string;
  location: string;
  status: BookingStatus;
};

export type MonthlyStatsData = {
  completedSessionsCount: number;
  revenueCents: number;
  distinctDogsCount: number;
  totalBookingsInPeriod: number;
};

const updateBookingReportSchema = z.object({
  bookingId: z.string().min(1),
  report: z.string().min(1).max(20_000),
});

async function requireEducatorProfileId() {
  return requireEducatorProfile();
}

type BookingWithRelations = Booking & {
  dog: Dog;
  service: Service;
  client: Pick<User, "name">;
};

function mapTodayBooking(
  booking: BookingWithRelations,
  location: string,
): TodayBookingItem {
  return {
    id: booking.id,
    time: formatTimeParis(booking.dateTime),
    dogName: booking.dog.name,
    ownerName: booking.client.name,
    serviceTitle: booking.service.title,
    location,
    status: booking.status,
  };
}

export async function getTodayBookings(): Promise<
  ActionResult<TodayBookingItem[]>
> {
  const educator = await requireEducatorProfileId();
  if (!educator.success) {
    return { success: false, error: educator.error };
  }

  const { startUtc, endUtc } = getParisDayBoundsUtc();
  const location = `${educator.data.address}, ${educator.data.city}`;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        dateTime: { gte: startUtc, lte: endUtc },
        status: { not: BookingStatus.CANCELLED },
      },
      include: {
        dog: true,
        service: true,
        client: { select: { name: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    return {
      success: true,
      data: bookings.map((b) => mapTodayBooking(b, location)),
    };
  } catch {
    return { success: false, error: "Impossible de charger les séances du jour." };
  }
}

export async function getMonthlyStats(): Promise<
  ActionResult<MonthlyStatsData>
> {
  const educator = await requireEducatorProfileId();
  if (!educator.success) {
    return { success: false, error: educator.error };
  }

  const { startUtc, endUtc } = getParisMonthToTodayBoundsUtc();

  try {
    const educatorProfileId = educator.data.educatorProfileId;

    const [completedBookings, totalBookingsInPeriod, distinctDogs] =
      await Promise.all([
        prisma.booking.findMany({
          where: {
            educatorProfileId,
            status: BookingStatus.COMPLETED,
            dateTime: { gte: startUtc, lte: endUtc },
          },
          include: { service: true },
        }),
        prisma.booking.count({
          where: {
            educatorProfileId,
            dateTime: { gte: startUtc, lte: endUtc },
            status: { not: BookingStatus.CANCELLED },
          },
        }),
        prisma.booking.findMany({
          where: {
            educatorProfileId,
            dateTime: { gte: startUtc, lte: endUtc },
          },
          distinct: ["dogId"],
          select: { dogId: true },
        }),
      ]);

    const revenueCents = completedBookings.reduce(
      (sum, booking) => sum + booking.service.price,
      0,
    );

    return {
      success: true,
      data: {
        completedSessionsCount: completedBookings.length,
        revenueCents,
        distinctDogsCount: distinctDogs.length,
        totalBookingsInPeriod,
      },
    };
  } catch {
    return { success: false, error: "Impossible de charger les statistiques." };
  }
}

export async function updateBookingReport(
  input: unknown,
): Promise<ActionResult<{ bookingId: string }>> {
  const parsed = updateBookingReportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides." };
  }

  const educator = await requireEducatorProfileId();
  if (!educator.success) {
    return { success: false, error: educator.error };
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: parsed.data.bookingId,
        educatorProfileId: educator.data.educatorProfileId,
      },
      select: { id: true, dogId: true },
    });

    if (!booking) {
      return { success: false, error: "Séance introuvable ou accès refusé." };
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { postSessionReport: parsed.data.report.trim() },
    });

    revalidatePath("/dashboard/seances");
    revalidatePath(`/dashboard/seances/${booking.id}`);
    revalidatePath("/dashboard/chiens");
    revalidatePath(`/dashboard/chiens/${booking.dogId}`);

    return { success: true, data: { bookingId: booking.id } };
  } catch {
    return { success: false, error: "Impossible d'enregistrer le compte-rendu." };
  }
}
