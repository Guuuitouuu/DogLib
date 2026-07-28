export type EducatorClientListItem = {
  /** Identifiant de ligne (chien suivi). */
  id: string;
  dogId: string;
  clientUserId: string;
  ownerName: string;
  email: string;
  phone: string | null;
  dogName: string;
  breed: string | null;
  /** Dernier service réservé (hors annulations). */
  lastServiceTitle: string | null;
  reservationsCount: number;
  completedReservationsCount: number;
  /** 0–100, part des réservations terminées (hors annulées). */
  completionPercent: number;
  nextBookingDateParis: string | null;
  nextBookingTimeParis: string | null;
  nextBookingStatus: string | null;
};
