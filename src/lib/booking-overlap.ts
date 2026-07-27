export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function bookingInterval(
  start: Date,
  durationMinutes: number,
): { start: Date; end: Date } {
  return {
    start,
    end: new Date(start.getTime() + durationMinutes * 60_000),
  };
}

export function overlapsExistingBooking(
  slotStart: Date,
  durationMinutes: number,
  existing: { dateTime: Date; service: { durationMinutes: number } }[],
): boolean {
  const slot = bookingInterval(slotStart, durationMinutes);
  return existing.some((booking) => {
    const other = bookingInterval(
      booking.dateTime,
      booking.service.durationMinutes,
    );
    return rangesOverlap(slot.start, slot.end, other.start, other.end);
  });
}
