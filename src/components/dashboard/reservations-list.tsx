"use client";

import Link from "next/link";
import { Clock, ChevronRight, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  EducatorBookingItem,
  EducatorBookingSummary,
} from "@/types/educator-booking";
import { BookingStatusActions } from "@/components/dashboard/booking-status-actions";
import {
  bookingStatusBadgeStyles,
  bookingStatusFilters,
  bookingStatusLabels,
  type BookingStatusFilter,
} from "@/lib/booking-ui";
import { formatPriceEurosFromCents } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type ReservationsListProps = {
  bookings: EducatorBookingItem[];
  summary: EducatorBookingSummary | null;
};

function formatReservationDate(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(utc);
}

export function ReservationsList({ bookings, summary }: ReservationsListProps) {
  const [filter, setFilter] = useState<BookingStatusFilter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((s) => s.status === filter);
  }, [bookings, filter]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Réservations ce mois",
            value: summary ? String(summary.reservationsThisMonth) : "—",
          },
          {
            label: "Heures dispensées",
            value: summary ? `${summary.hoursThisMonth}h` : "—",
          },
          {
            label: "Réservations terminées",
            value: summary ? String(summary.completedThisMonth) : "—",
          },
          {
            label: "Revenu réservations",
            value: summary
              ? formatPriceEurosFromCents(summary.revenueCentsThisMonth)
              : "—",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {bookingStatusFilters.map((f) => (
          <button
            key={String(f.value)}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Aucune réservation pour ce filtre.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((s) => (
            <article
              key={s.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md lg:flex-row lg:items-center"
            >
              <img
                src="/placeholder.svg"
                alt=""
                className="size-14 shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-foreground">
                    {s.dogName}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      bookingStatusBadgeStyles[s.status],
                    )}
                  >
                    {bookingStatusLabels[s.status]}
                  </span>
                </div>
                <p className="truncate text-sm text-foreground">
                  {s.serviceTitle}
                </p>
                <p className="text-xs text-muted-foreground">{s.ownerName}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground lg:flex-col lg:items-end lg:gap-1">
                <span className="font-medium capitalize text-foreground">
                  {formatReservationDate(s.dateParis)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {s.timeParis} · {s.durationMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {s.location}
                </span>
              </div>

              <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border pt-3 lg:min-w-[160px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <span className="text-base font-bold text-foreground">
                  {formatPriceEurosFromCents(s.priceCents)}
                </span>
                <BookingStatusActions
                  bookingId={s.id}
                  status={s.status}
                  compact
                />
                <Link
                  href={`/dashboard/reservations/${s.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Compte-rendu
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
