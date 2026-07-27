"use client";

import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import {
  listEducatorBookingsForDay,
  listEducatorBookingsForWeek,
} from "@/actions/educator-bookings";
import { BookingStatusActions } from "@/components/dashboard/booking-status-actions";
import type { EducatorBookingItem } from "@/types/educator-booking";
import { BookingStatus } from "@/lib/booking-status";
import {
  agendaStatusFilters,
  bookingStatusAgendaDotStyles,
  bookingStatusAgendaEventStyles,
  bookingStatusBadgeStyles,
  bookingStatusLabels,
  type BookingStatusFilter,
} from "@/lib/booking-ui";
import { formatPriceEurosFromCents } from "@/lib/format-price";
import {
  addParisDays,
  defaultAgendaHours,
  formatParisWeekRangeLabel,
  toParisDateString,
} from "@/lib/paris-time";
import { cn } from "@/lib/utils";

const weekDayHeaders = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

export type AgendaWeekMeta = {
  weekStartDateStr: string;
  days: {
    dateStr: string;
    dayOfMonth: number;
    weekdayShort: string;
    weekdayIndex: number;
  }[];
};

type EducatorAgendaPanelProps = {
  initialWeek: AgendaWeekMeta;
  initialWeekBookings: EducatorBookingItem[];
  initialDayParis: string;
  initialDayBookings: EducatorBookingItem[];
};

function withoutCancelled(items: EducatorBookingItem[]): EducatorBookingItem[] {
  return items.filter((b) => b.status !== BookingStatus.CANCELLED);
}

function bookingMatchesHour(booking: EducatorBookingItem, hour: string): boolean {
  return booking.timeParis.slice(0, 2) === hour.slice(0, 2);
}

function formatDayNavLabel(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(utc);
}

export function EducatorAgendaPanel({
  initialWeek,
  initialWeekBookings,
  initialDayParis,
  initialDayBookings,
}: EducatorAgendaPanelProps) {
  const router = useRouter();
  const [view, setView] = useState<"week" | "day">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekMeta, setWeekMeta] = useState(initialWeek);
  const [weekBookings, setWeekBookings] = useState<EducatorBookingItem[]>(() =>
    withoutCancelled(initialWeekBookings),
  );
  const [dayParis, setDayParis] = useState(initialDayParis);
  const [dayBookings, setDayBookings] = useState<EducatorBookingItem[]>(() =>
    withoutCancelled(initialDayBookings),
  );
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const weekRangeLabel = useMemo(
    () =>
      formatParisWeekRangeLabel(
        weekMeta.weekStartDateStr,
        weekMeta.days[6]?.dateStr ?? weekMeta.weekStartDateStr,
      ),
    [weekMeta],
  );

  const visibleWeekBookings = useMemo(() => {
    const base = withoutCancelled(weekBookings);
    if (statusFilter === "all") return base;
    return base.filter((b) => b.status === statusFilter);
  }, [weekBookings, statusFilter]);

  const visibleDayBookings = useMemo(() => {
    const base = withoutCancelled(dayBookings);
    if (statusFilter === "all") return base;
    return base.filter((b) => b.status === statusFilter);
  }, [dayBookings, statusFilter]);

  useEffect(() => {
    setWeekBookings(withoutCancelled(initialWeekBookings));
    setDayBookings(withoutCancelled(initialDayBookings));
  }, [initialWeekBookings, initialDayBookings]);

  const reloadWeek = useCallback(
    (offset: number, filter: BookingStatusFilter) => {
      startTransition(async () => {
        setError(null);
        const result = await listEducatorBookingsForWeek(offset, filter);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setWeekMeta({
          weekStartDateStr: result.data.week.weekStartDateStr,
          days: result.data.week.days,
        });
        setWeekBookings(withoutCancelled(result.data.bookings));
        router.refresh();
      });
    },
    [router],
  );

  const reloadDay = useCallback(
    (date: string, filter: BookingStatusFilter) => {
      startTransition(async () => {
        setError(null);
        const result = await listEducatorBookingsForDay(date, filter);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setDayBookings(withoutCancelled(result.data));
        router.refresh();
      });
    },
    [router],
  );

  function onFilterChange(filter: BookingStatusFilter) {
    setStatusFilter(filter);
    if (view === "week") {
      reloadWeek(weekOffset, filter);
    } else {
      reloadDay(dayParis, filter);
    }
  }

  function shiftWeek(delta: number) {
    const next = weekOffset + delta;
    setWeekOffset(next);
    reloadWeek(next, statusFilter);
  }

  function shiftDay(delta: number) {
    const next = addParisDays(dayParis, delta);
    setDayParis(next);
    reloadDay(next, statusFilter);
  }

  const todayParis = toParisDateString(new Date());

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setView("week")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              view === "week"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Semaine
          </button>
          <button
            type="button"
            onClick={() => setView("day")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              view === "day"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Jour
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {agendaStatusFilters.map((f) => (
            <button
              key={String(f.value)}
              type="button"
              onClick={() => onFilterChange(f.value)}
              disabled={pending}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {view === "week" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Semaine précédente"
                disabled={pending}
                onClick={() => shiftWeek(-1)}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Semaine suivante"
                disabled={pending}
                onClick={() => shiftWeek(1)}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ChevronRight className="size-4" />
              </button>
              <p className="ml-1 text-sm font-semibold text-foreground">
                {weekRangeLabel}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {(
                [
                  BookingStatus.CONFIRMED,
                  BookingStatus.PENDING,
                  BookingStatus.COMPLETED,
                ] as const
              ).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      bookingStatusAgendaDotStyles[s],
                    )}
                  />
                  {bookingStatusLabels[s]}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border">
                <div className="border-r border-border" />
                {weekMeta.days.map((d, i) => {
                  const isToday = d.dateStr === todayParis;
                  return (
                    <div
                      key={d.dateStr}
                      className={cn(
                        "px-2 py-3 text-center",
                        i < 6 && "border-r border-border",
                        isToday && "bg-primary/5",
                      )}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {weekDayHeaders[i]}
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {d.dayOfMonth}
                      </p>
                    </div>
                  );
                })}
              </div>

              {defaultAgendaHours.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border last:border-b-0"
                >
                  <div className="border-r border-border px-2 py-3 text-right text-xs font-medium text-muted-foreground">
                    {hour}
                  </div>
                  {weekMeta.days.map((d, dayIndex) => {
                    const cellEvents = visibleWeekBookings.filter(
                      (b) =>
                        b.dateParis === d.dateStr &&
                        bookingMatchesHour(b, hour),
                    );
                    const isToday = d.dateStr === todayParis;
                    return (
                      <div
                        key={`${d.dateStr}-${hour}`}
                        className={cn(
                          "min-h-[68px] space-y-1 p-1.5",
                          dayIndex < 6 && "border-r border-border",
                          isToday && "bg-primary/5",
                        )}
                      >
                        {cellEvents.map((e) => (
                          <div
                            key={e.id}
                            className={cn(
                              "w-full rounded-lg border px-2 py-1.5 text-left",
                              bookingStatusAgendaEventStyles[e.status],
                            )}
                          >
                            <p className="flex items-center justify-between gap-1 text-xs font-semibold leading-tight">
                              <span className="truncate">{e.dogName}</span>
                              <span className="shrink-0 text-[10px] font-medium opacity-70">
                                {e.timeParis}
                              </span>
                            </p>
                            <p className="truncate text-[11px] leading-tight opacity-80">
                              {e.serviceTitle}
                            </p>
                            <p className="mt-0.5 flex items-center gap-0.5 text-[10px] opacity-70">
                              <MapPin className="size-2.5 shrink-0" />
                              <span className="truncate">{e.location}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Jour précédent"
                disabled={pending}
                onClick={() => shiftDay(-1)}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Jour suivant"
                disabled={pending}
                onClick={() => shiftDay(1)}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ChevronRight className="size-4" />
              </button>
              <p className="ml-1 text-sm font-semibold capitalize text-foreground">
                {formatDayNavLabel(dayParis)}
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:opacity-80"
              onClick={() => {
                setDayParis(todayParis);
                reloadDay(todayParis, statusFilter);
              }}
            >
              Aujourd&apos;hui
            </button>
          </div>

          {visibleDayBookings.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
              Aucune séance pour ce jour avec ce filtre.
            </p>
          ) : (
            <ul className="space-y-3">
              {visibleDayBookings.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex flex-col items-center justify-center rounded-lg bg-secondary px-3 py-2">
                    <span className="text-sm font-bold text-foreground">
                      {s.timeParis}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.durationMinutes} min
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {s.dogName}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          bookingStatusBadgeStyles[s.status],
                        )}
                      >
                        {bookingStatusLabels[s.status]}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{s.serviceTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.ownerName}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      {s.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:min-w-[140px]">
                    <span className="text-sm font-bold text-foreground">
                      {formatPriceEurosFromCents(s.priceCents)}
                    </span>
                    <BookingStatusActions
                      bookingId={s.id}
                      status={s.status}
                      compact
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {pending ? (
        <p className="text-xs text-muted-foreground">Chargement…</p>
      ) : null}
    </div>
  );
}
