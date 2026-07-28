import type { BookingStatusValue } from "@/lib/booking-status";

export type EducatorDogListItem = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  ownerName: string;
  reservationsCount: number;
  lastReservationDateParis: string | null;
  reportsCount: number;
};

export type EducatorDogDetail = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  behavioralNotes: string | null;
  medicalNotes: string | null;
  ownerName: string;
  ownerEmail: string;
  reservations: EducatorDogReservationItem[];
};

export type EducatorDogReservationItem = {
  bookingId: string;
  dateParis: string;
  timeParis: string;
  serviceTitle: string;
  status: BookingStatusValue;
  postSessionReport: string | null;
};
