import { ChevronRight, MapPin } from "lucide-react";

import type { TodayBookingItem } from "@/actions/educator";
import { BookingStatus } from "@/generated/prisma/client";
import { formatParisDayLabel } from "@/lib/paris-time";
import { cn } from "@/lib/utils";

const statusLabels: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: "Confirmée",
  [BookingStatus.PENDING]: "En attente",
  [BookingStatus.CANCELLED]: "Annulée",
  [BookingStatus.COMPLETED]: "Terminée",
};

const statusStyles: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: "bg-accent text-accent-foreground",
  [BookingStatus.PENDING]: "bg-chart-3/20 text-chart-4",
  [BookingStatus.CANCELLED]: "bg-muted text-muted-foreground",
  [BookingStatus.COMPLETED]: "bg-primary/12 text-primary",
};

type UpcomingSessionsProps = {
  bookings: TodayBookingItem[];
};

export function UpcomingSessions({ bookings }: UpcomingSessionsProps) {
  const dayLabel = formatParisDayLabel();

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Séances du jour
          </h2>
          <p className="text-sm text-muted-foreground capitalize">{dayLabel}</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          Agenda
          <ChevronRight className="size-4" />
        </button>
      </div>

      {bookings.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Aucune séance prévue aujourd&apos;hui.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {bookings.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-background/60 p-3 transition-colors hover:border-primary/40"
            >
              <div className="flex flex-col items-center justify-center rounded-lg bg-secondary px-2.5 py-1.5">
                <span className="text-sm font-bold text-foreground">{s.time}</span>
              </div>
              <img
                src="/placeholder.svg"
                alt=""
                className="size-11 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {s.dogName}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      statusStyles[s.status],
                    )}
                  >
                    {statusLabels[s.status]}
                  </span>
                </div>
                <p className="truncate text-sm text-foreground">{s.serviceTitle}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{s.ownerName}</span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{s.location}</span>
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
