"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  BookingStatus as PrismaBookingStatus,
  type Booking,
  type Dog,
  type Service,
  type User,
} from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { overlapsExistingBooking } from "@/lib/booking-overlap";
import type { BookingStatusFilter } from "@/lib/booking-ui";
import { BOOKING_STATUS_VALUES } from "@/lib/booking-status";
import {
  formatTimeParis,
  getParisDayBoundsFromDateStr,
  getParisMonthToTodayBoundsUtc,
  getParisWeekBoundsUtc,
  toParisDateString,
} from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type {
  EducatorBookingItem,
  EducatorBookingSummary,
} from "@/types/educator-booking";

const bookingStatusSchema = z.enum(BOOKING_STATUS_VALUES);

const listBookingsSchema = z.object({
  startUtcIso: z.string().min(1),
  endUtcIso: z.string().min(1),
  status: z.union([z.literal("all"), bookingStatusSchema]).optional(),
  excludeCancelled: z.boolean().optional(),
});

const bookingIdSchema = z.object({
  bookingId: z.string().min(1),
});

export async function getEducatorBookingById(
  input: unknown,
): Promise<ActionResult<EducatorBookingItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = bookingIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identifiant invalide." };
  }

  const location = `${educator.data.address}, ${educator.data.city}`;

  try {
    const row = await prisma.booking.findFirst({
      where: {
        id: parsed.data.bookingId,
        educatorProfileId: educator.data.educatorProfileId,
      },
      include: {
        dog: true,
        service: true,
        client: { select: { name: true } },
      },
    });

    if (!row) {
      return { success: false, error: "Séance introuvable." };
    }

    return { success: true, data: mapBooking(row, location) };
  } catch (error) {
    console.error("[getEducatorBookingById]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger la séance.",
    };
  }
}

const updateStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: bookingStatusSchema,
});

type BookingRow = Booking & {
  dog: Dog;
  service: Service;
  client: Pick<User, "name">;
};

function mapBooking(row: BookingRow, location: string): EducatorBookingItem {
  const dateParis = toParisDateString(row.dateTime);
  return {
    id: row.id,
    dateTimeUtcIso: row.dateTime.toISOString(),
    dateParis,
    timeParis: formatTimeParis(row.dateTime),
    durationMinutes: row.service.durationMinutes,
    status: row.status,
    dogId: row.dogId,
    dogName: row.dog.name,
    ownerName: row.client.name,
    serviceTitle: row.service.title,
    priceCents: row.service.price,
    location,
    postSessionReport: row.postSessionReport,
  };
}

function statusWhere(
  filter: BookingStatusFilter | undefined,
  excludeCancelled?: boolean,
):
  | { status?: PrismaBookingStatus | { not: PrismaBookingStatus } }
  | Record<string, never> {
  if (filter && filter !== "all") {
    return { status: filter as PrismaBookingStatus };
  }
  if (excludeCancelled) {
    return { status: { not: PrismaBookingStatus.CANCELLED } };
  }
  return {};
}

export async function listEducatorBookings(
  input: unknown,
): Promise<ActionResult<EducatorBookingItem[]>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = listBookingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Période invalide." };
  }

  const startUtc = new Date(parsed.data.startUtcIso);
  const endUtc = new Date(parsed.data.endUtcIso);
  if (Number.isNaN(startUtc.getTime()) || Number.isNaN(endUtc.getTime())) {
    return { success: false, error: "Période invalide." };
  }

  const location = `${educator.data.address}, ${educator.data.city}`;

  if (
    parsed.data.excludeCancelled &&
    parsed.data.status === PrismaBookingStatus.CANCELLED
  ) {
    return { success: true, data: [] };
  }

  try {
    const rows = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        dateTime: { gte: startUtc, lte: endUtc },
        ...statusWhere(parsed.data.status, parsed.data.excludeCancelled),
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
      data: rows.map((row) => mapBooking(row, location)),
    };
  } catch (error) {
    console.error("[listEducatorBookings]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger les réservations.",
    };
  }
}

export async function getEducatorBookingSummary(): Promise<
  ActionResult<EducatorBookingSummary>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const { startUtc, endUtc } = getParisMonthToTodayBoundsUtc();

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        dateTime: { gte: startUtc, lte: endUtc },
        status: { not: PrismaBookingStatus.CANCELLED },
      },
      include: { service: true },
    });

    const completed = bookings.filter(
      (b) => b.status === PrismaBookingStatus.COMPLETED,
    );
    const minutes = bookings.reduce(
      (sum, b) => sum + b.service.durationMinutes,
      0,
    );
    const revenueCents = completed.reduce(
      (sum, b) => sum + b.service.price,
      0,
    );

    return {
      success: true,
      data: {
        sessionsThisMonth: bookings.length,
        hoursThisMonth: Math.round(minutes / 60),
        revenueCentsThisMonth: revenueCents,
        completedThisMonth: completed.length,
      },
    };
  } catch {
    return {
      success: false,
      error: "Impossible de charger le résumé des séances.",
    };
  }
}

function canTransition(
  from: PrismaBookingStatus,
  to: PrismaBookingStatus,
): boolean {
  if (from === to) return false;
  switch (from) {
    case PrismaBookingStatus.PENDING:
      return (
        to === PrismaBookingStatus.CONFIRMED ||
        to === PrismaBookingStatus.CANCELLED
      );
    case PrismaBookingStatus.CONFIRMED:
      return (
        to === PrismaBookingStatus.COMPLETED ||
        to === PrismaBookingStatus.CANCELLED
      );
    default:
      return false;
  }
}

function revalidateBookingViews() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/seances");
}

export async function getPendingEducatorBookingsCount(): Promise<
  ActionResult<number>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const count = await prisma.booking.count({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        status: PrismaBookingStatus.PENDING,
      },
    });
    return { success: true, data: count };
  } catch {
    return {
      success: false,
      error: "Impossible de compter les séances en attente.",
    };
  }
}

export async function updateEducatorBookingStatus(
  input: unknown,
): Promise<ActionResult<EducatorBookingItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Mise à jour invalide." };
  }

  const location = `${educator.data.address}, ${educator.data.city}`;

  try {
    const existing = await prisma.booking.findFirst({
      where: {
        id: parsed.data.bookingId,
        educatorProfileId: educator.data.educatorProfileId,
      },
      include: {
        dog: true,
        service: true,
        client: { select: { name: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Réservation introuvable." };
    }

    if (!canTransition(existing.status, parsed.data.status)) {
      return {
        success: false,
        error: `Transition de statut non autorisée.`,
      };
    }

    if (parsed.data.status === PrismaBookingStatus.CONFIRMED) {
      const dateParis = toParisDateString(existing.dateTime);
      const { startUtc, endUtc } = getParisDayBoundsFromDateStr(dateParis);
      const sameDay = await prisma.booking.findMany({
        where: {
          educatorProfileId: educator.data.educatorProfileId,
          id: { not: existing.id },
          status: {
            in: [PrismaBookingStatus.PENDING, PrismaBookingStatus.CONFIRMED],
          },
          dateTime: { gte: startUtc, lte: endUtc },
        },
        include: { service: { select: { durationMinutes: true } } },
      });

      if (
        overlapsExistingBooking(
          existing.dateTime,
          existing.service.durationMinutes,
          sameDay,
        )
      ) {
        return {
          success: false,
          error:
            "Ce créneau chevauche une autre réservation active.",
        };
      }
    }

    const row = await prisma.booking.update({
      where: { id: existing.id },
      data: { status: parsed.data.status },
      include: {
        dog: true,
        service: true,
        client: { select: { name: true } },
      },
    });

    revalidateBookingViews();
    return { success: true, data: mapBooking(row, location) };
  } catch (error) {
    console.error("[updateEducatorBookingStatus]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de mettre à jour la réservation.",
    };
  }
}

export async function confirmEducatorBooking(
  input: unknown,
): Promise<ActionResult<EducatorBookingItem>> {
  const parsed = bookingIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identifiant invalide." };
  }
  return updateEducatorBookingStatus({
    bookingId: parsed.data.bookingId,
    status: PrismaBookingStatus.CONFIRMED,
  });
}

export async function cancelEducatorBooking(
  input: unknown,
): Promise<ActionResult<EducatorBookingItem>> {
  const parsed = bookingIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identifiant invalide." };
  }
  return updateEducatorBookingStatus({
    bookingId: parsed.data.bookingId,
    status: PrismaBookingStatus.CANCELLED,
  });
}

export async function completeEducatorBooking(
  input: unknown,
): Promise<ActionResult<EducatorBookingItem>> {
  const parsed = bookingIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identifiant invalide." };
  }
  return updateEducatorBookingStatus({
    bookingId: parsed.data.bookingId,
    status: PrismaBookingStatus.COMPLETED,
  });
}

export async function listEducatorBookingsForWeek(
  weekOffset = 0,
  status: BookingStatusFilter = "all",
): Promise<
  ActionResult<{
    bookings: EducatorBookingItem[];
    week: ReturnType<typeof getParisWeekBoundsUtc>;
  }>
> {
  const week = getParisWeekBoundsUtc(new Date(), weekOffset);
  if (
    status === (PrismaBookingStatus.CANCELLED as BookingStatusFilter)
  ) {
    return {
      success: true,
      data: { bookings: [], week },
    };
  }
  const result = await listEducatorBookings({
    startUtcIso: week.startUtc.toISOString(),
    endUtcIso: week.endUtc.toISOString(),
    status: status === "all" ? "all" : status,
    excludeCancelled: true,
  });
  if (!result.success) return result;
  return { success: true, data: { bookings: result.data, week } };
}

export async function listEducatorBookingsForDay(
  dateParis: string,
  status: BookingStatusFilter = "all",
): Promise<ActionResult<EducatorBookingItem[]>> {
  if (status === (PrismaBookingStatus.CANCELLED as BookingStatusFilter)) {
    return { success: true, data: [] };
  }
  const { startUtc, endUtc } = getParisDayBoundsFromDateStr(dateParis);
  return listEducatorBookings({
    startUtcIso: startUtc.toISOString(),
    endUtcIso: endUtc.toISOString(),
    status: status === "all" ? "all" : status,
    excludeCancelled: true,
  });
}
