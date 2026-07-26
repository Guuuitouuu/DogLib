import { BookingStatus } from "@/generated/prisma/client";
import {
  formatTimeParis,
  parisSlotStartUtc,
} from "@/lib/paris-time";

type AvailabilityRow = {
  startTime: string;
  endTime: string;
};

type BookingRow = {
  dateTime: Date;
  service: { durationMinutes: number };
};

function parseHm(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export type AvailableSlot = {
  startUtcIso: string;
  label: string;
};

export function computeAvailableSlots(params: {
  dateStr: string;
  durationMinutes: number;
  availabilities: AvailabilityRow[];
  bookings: BookingRow[];
  now?: Date;
}): AvailableSlot[] {
  const { dateStr, durationMinutes, availabilities, bookings } = params;
  const now = params.now ?? new Date();
  const slots: AvailableSlot[] = [];

  for (const window of availabilities) {
    const startMin = parseHm(window.startTime);
    const endMin = parseHm(window.endTime);

    for (
      let cursor = startMin;
      cursor + durationMinutes <= endMin;
      cursor += durationMinutes
    ) {
      const hour = Math.floor(cursor / 60);
      const minute = cursor % 60;
      const slotStart = parisSlotStartUtc(dateStr, hour, minute);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

      if (slotStart < now) {
        continue;
      }

      const blocked = bookings.some((booking) => {
        const bookingEnd = new Date(
          booking.dateTime.getTime() +
            booking.service.durationMinutes * 60_000,
        );
        return rangesOverlap(slotStart, slotEnd, booking.dateTime, bookingEnd);
      });

      if (!blocked) {
        slots.push({
          startUtcIso: slotStart.toISOString(),
          label: formatTimeParis(slotStart),
        });
      }
    }
  }

  return slots;
}

export function bookingStatusesBlockingAvailability(): BookingStatus[] {
  return [BookingStatus.PENDING, BookingStatus.CONFIRMED];
}
