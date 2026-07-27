import type { BookingStatusValue } from "@/lib/booking-status";

export type EducatorDogListItem = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  ownerName: string;
  sessionsCount: number;
  lastSessionDateParis: string | null;
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
  sessions: EducatorDogSessionItem[];
};

export type EducatorDogSessionItem = {
  bookingId: string;
  dateParis: string;
  timeParis: string;
  serviceTitle: string;
  status: BookingStatusValue;
  postSessionReport: string | null;
};
