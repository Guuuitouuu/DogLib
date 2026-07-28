import type { MonthlyStatsData, TodayBookingItem } from "@/actions/educator";
import { BookingStatus } from "@/generated/prisma/client";

export const demoMonthlyStats: MonthlyStatsData = {
  completedReservationsCount: 12,
  revenueCents: 84000,
  distinctDogsCount: 9,
  totalBookingsInPeriod: 16,
};

export const demoTodayBookings: TodayBookingItem[] = [
  {
    id: "demo-1",
    time: "09:30",
    dogName: "Ollie",
    ownerName: "Camille Dubois",
    serviceTitle: "Éducation de base",
    location: "Parc de la Tête d'Or, Lyon",
    status: BookingStatus.CONFIRMED,
  },
  {
    id: "demo-2",
    time: "11:00",
    dogName: "Nala",
    ownerName: "Thomas Girard",
    serviceTitle: "Rappel & marche en laisse",
    location: "À domicile",
    status: BookingStatus.CONFIRMED,
  },
  {
    id: "demo-3",
    time: "14:15",
    dogName: "Gaston",
    ownerName: "Léa Moreau",
    serviceTitle: "Bilan comportemental",
    location: "Centre canin",
    status: BookingStatus.PENDING,
  },
  {
    id: "demo-4",
    time: "16:30",
    dogName: "Pixel",
    ownerName: "Hugo Lefèvre",
    serviceTitle: "Socialisation chiot",
    location: "Parc de la Tête d'Or, Lyon",
    status: BookingStatus.PENDING,
  },
];
