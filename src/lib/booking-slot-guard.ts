import type { Prisma } from "@/generated/prisma/client";

import {
  bookingStatusesBlockingAvailability,
  computeAvailableSlots,
} from "@/lib/availability-slots";
import { overlapsExistingBooking } from "@/lib/booking-overlap";
import {
  getParisWeekdayFromDateString,
  parisDateStringToBounds,
} from "@/lib/paris-time";

export class SlotUnavailableError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string) {
    super(`SLOT_UNAVAILABLE:${userMessage}`);
    this.userMessage = userMessage;
  }
}

export function slotUnavailableMessage(error: unknown): string | null {
  if (error instanceof SlotUnavailableError) {
    return error.userMessage;
  }
  if (error instanceof Error && error.message.startsWith("SLOT_UNAVAILABLE:")) {
    return error.message.slice("SLOT_UNAVAILABLE:".length);
  }
  return null;
}

export async function assertEducatorSlotAvailable(
  tx: Prisma.TransactionClient,
  params: {
    educatorProfileId: string;
    serviceId: string;
    slotStart: Date;
    durationMinutes: number;
  },
): Promise<void> {
  const { educatorProfileId, serviceId, slotStart, durationMinutes } = params;

  const dateParis = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(slotStart);

  const dayOfWeek = getParisWeekdayFromDateString(dateParis);
  const { startUtc, endUtc } = parisDateStringToBounds(dateParis);

  const [availabilities, bookings] = await Promise.all([
    tx.availability.findMany({
      where: { educatorProfileId, dayOfWeek, isActive: true },
      select: { startTime: true, endTime: true },
    }),
    tx.booking.findMany({
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
    durationMinutes,
    availabilities,
    bookings,
  });

  const stillAvailable = slots.some(
    (slot) => slot.startUtcIso === slotStart.toISOString(),
  );

  if (!stillAvailable) {
    throw new SlotUnavailableError(
      "Ce créneau n’est plus disponible. Choisissez un autre horaire.",
    );
  }

  const blocking = await tx.booking.findMany({
    where: {
      educatorProfileId,
      status: { in: bookingStatusesBlockingAvailability() },
      dateTime: { gte: startUtc, lte: endUtc },
    },
    include: { service: { select: { durationMinutes: true } } },
  });

  if (
    overlapsExistingBooking(slotStart, durationMinutes, blocking)
  ) {
    throw new SlotUnavailableError(
      "Ce créneau vient d’être réservé. Choisissez un autre horaire.",
    );
  }
}
