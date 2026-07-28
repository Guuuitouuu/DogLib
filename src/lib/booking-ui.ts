import {
  BookingStatus,
  type BookingStatusValue,
} from "@/lib/booking-status";

export { BookingStatus, type BookingStatusValue };

export const bookingStatusLabels: Record<BookingStatusValue, string> = {
  [BookingStatus.CONFIRMED]: "Confirmée",
  [BookingStatus.PENDING]: "En attente",
  [BookingStatus.COMPLETED]: "Terminée",
  [BookingStatus.CANCELLED]: "Annulée",
};

/** Pastille / badge (liste, réservations du jour) */
export const bookingStatusBadgeStyles: Record<BookingStatusValue, string> = {
  [BookingStatus.CONFIRMED]: "bg-primary/15 text-primary",
  [BookingStatus.PENDING]: "bg-accent text-accent-foreground",
  [BookingStatus.COMPLETED]: "bg-muted text-muted-foreground",
  [BookingStatus.CANCELLED]: "bg-destructive/10 text-destructive",
};

/** Blocs agenda (bordures, fond) */
export const bookingStatusAgendaEventStyles: Record<
  BookingStatusValue,
  string
> = {
  [BookingStatus.CONFIRMED]: "bg-primary/12 border-primary/30 text-foreground",
  [BookingStatus.PENDING]:
    "bg-accent border-accent-foreground/20 text-accent-foreground",
  [BookingStatus.COMPLETED]: "bg-muted/80 border-border text-foreground",
  [BookingStatus.CANCELLED]:
    "bg-destructive/10 border-destructive/30 text-foreground",
};

export const bookingStatusAgendaDotStyles: Record<BookingStatusValue, string> =
  {
    [BookingStatus.CONFIRMED]: "bg-primary",
    [BookingStatus.PENDING]: "bg-accent-foreground",
    [BookingStatus.COMPLETED]: "bg-muted-foreground",
    [BookingStatus.CANCELLED]: "bg-destructive",
  };

export type BookingStatusFilter = BookingStatusValue | "all";

export const bookingStatusFilters: {
  value: BookingStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Toutes" },
  { value: BookingStatus.CONFIRMED, label: "Confirmées" },
  { value: BookingStatus.PENDING, label: "En attente" },
  { value: BookingStatus.COMPLETED, label: "Terminées" },
  { value: BookingStatus.CANCELLED, label: "Annulées" },
];

/** Filtres agenda : les annulées restent visibles uniquement dans Réservations. */
export const agendaStatusFilters = bookingStatusFilters.filter(
  (f) => f.value !== BookingStatus.CANCELLED,
);
