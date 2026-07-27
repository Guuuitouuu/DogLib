/** Valeurs alignées sur l’enum Prisma `BookingStatus` — safe côté client (pas d’import Prisma). */
export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type BookingStatusValue =
  (typeof BookingStatus)[keyof typeof BookingStatus];

export const BOOKING_STATUS_VALUES: BookingStatusValue[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
  BookingStatus.COMPLETED,
];
