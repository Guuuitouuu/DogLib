import type { BookingStatusValue } from "@/lib/booking-status";

export type EducatorBookingItem = {
  id: string;
  dateTimeUtcIso: string;
  dateParis: string;
  timeParis: string;
  durationMinutes: number;
  status: BookingStatusValue;
  dogId: string;
  dogName: string;
  ownerName: string;
  serviceTitle: string;
  priceCents: number;
  location: string;
  postSessionReport: string | null;
};

export type EducatorBookingSummary = {
  reservationsThisMonth: number;
  hoursThisMonth: number;
  revenueCentsThisMonth: number;
  completedThisMonth: number;
};
