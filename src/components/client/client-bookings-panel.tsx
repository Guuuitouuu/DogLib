"use client";

import Link from "next/link";
import { Clock, FileText, MapPin } from "lucide-react";
import { useState } from "react";

import { ClientCancelBookingButton } from "@/components/client/client-cancel-booking-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPriceEurosFromCents } from "@/lib/format-price";
import {
  bookingStatusBadgeStyles,
  bookingStatusLabels,
} from "@/lib/booking-ui";
import type { BookingStatusValue } from "@/lib/booking-status";
import { cn } from "@/lib/utils";
import type { ClientBookingItem } from "@/types/client-dashboard";

type ClientBookingsPanelProps = {
  upcoming: ClientBookingItem[];
  past: ClientBookingItem[];
};

const actionButtonClass =
  "h-auto min-h-9 w-full min-w-0 whitespace-normal py-2 text-center leading-snug sm:w-auto";

function formatReservationDate(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(utc);
}

function BookingCard({
  booking,
  variant,
}: {
  booking: ClientBookingItem;
  variant: "upcoming" | "past";
}) {
  const status = booking.status as BookingStatusValue;
  const [reportOpen, setReportOpen] = useState(false);
  const hasReport =
    booking.postSessionReport != null &&
    booking.postSessionReport.trim().length > 0;

  return (
    <article className="min-w-0 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="break-words text-sm font-bold text-foreground">
              {booking.dogName}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                bookingStatusBadgeStyles[status],
              )}
            >
              {bookingStatusLabels[status]}
            </span>
          </div>
          <p className="mt-0.5 break-words text-sm text-foreground">
            {booking.serviceTitle}
          </p>
          <p className="break-words text-xs text-muted-foreground">
            {booking.educatorName}
          </p>
        </div>
        <p className="shrink-0 text-base font-bold text-foreground">
          {formatPriceEurosFromCents(booking.priceCents)}
        </p>
      </div>

      <ul className="min-w-0 space-y-1.5 text-xs text-muted-foreground">
        <li className="min-w-0 break-words font-medium capitalize text-foreground">
          {formatReservationDate(booking.dateParis)}
        </li>
        <li className="flex min-w-0 items-start gap-2">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 break-words">
            {booking.timeParis} · {booking.durationMinutes} min
          </span>
        </li>
        <li className="flex min-w-0 items-start gap-2">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 break-words">{booking.location}</span>
        </li>
      </ul>

      <div className="flex min-w-0 flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:flex-wrap">
        {variant === "upcoming" ? (
          <>
            {booking.canCancel ? (
              <ClientCancelBookingButton
                bookingId={booking.id}
                dogName={booking.dogName}
                compact
                className={actionButtonClass}
              />
            ) : booking.cancelBlockedReason ? (
              <p className="w-full min-w-0 break-words text-xs text-muted-foreground text-balance">
                {booking.cancelBlockedReason}
              </p>
            ) : null}
            <Link
              href={`/educator/${booking.educatorProfileId}`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: actionButtonClass,
              })}
            >
              Voir l&apos;éducateur
            </Link>
          </>
        ) : (
          <>
            {hasReport ? (
              <>
                <button
                  type="button"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: actionButtonClass,
                  })}
                  onClick={() => setReportOpen(true)}
                >
                  <FileText className="size-4 shrink-0" aria-hidden />
                  Compte-rendu
                </button>
                <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                  <DialogContent className="max-h-[85vh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-lg">
                    <DialogHeader className="min-w-0">
                      <DialogTitle>Compte-rendu de réservation</DialogTitle>
                      <DialogDescription className="break-words">
                        {formatReservationDate(booking.dateParis)} ·{" "}
                        {booking.serviceTitle} · {booking.educatorName}
                      </DialogDescription>
                    </DialogHeader>
                    <p className="min-w-0 break-words whitespace-pre-wrap text-sm text-foreground">
                      {booking.postSessionReport}
                    </p>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <p className="w-full text-xs italic text-muted-foreground">
                Compte-rendu pas encore disponible.
              </p>
            )}
            <Link
              href={`/account/chiens/${booking.dogId}`}
              className={buttonVariants({
                variant: "link",
                size: "sm",
                className: cn(actionButtonClass, "justify-center sm:justify-start"),
              })}
            >
              Voir sur la fiche chien
            </Link>
          </>
        )}
      </div>
    </article>
  );
}

export function ClientBookingsPanel({
  upcoming,
  past,
}: ClientBookingsPanelProps) {
  return (
    <div className="min-w-0 space-y-8">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-lg">Réservations à venir</CardTitle>
          <CardDescription className="break-words">
            Statut, éducateur, chien, horaire et lieu de rendez-vous.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 space-y-3">
          {upcoming.length === 0 ? (
            <p className="break-words text-sm text-muted-foreground">
              Aucun rendez-vous planifié.{" "}
              <Link href="/account/educateurs" className="text-primary underline">
                Trouver un éducateur
              </Link>
              .
            </p>
          ) : (
            upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} variant="upcoming" />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-lg">Historique</CardTitle>
          <CardDescription className="break-words">
            Réservations passées et comptes-rendus laissés par vos éducateurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 space-y-3">
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Votre historique apparaîtra ici après vos premières réservations.
            </p>
          ) : (
            past.map((b) => (
              <BookingCard key={b.id} booking={b} variant="past" />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
