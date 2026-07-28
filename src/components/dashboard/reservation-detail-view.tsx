"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateBookingReport } from "@/actions/educator";
import { BookingStatusActions } from "@/components/dashboard/booking-status-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatPriceEurosFromCents } from "@/lib/format-price";
import {
  bookingStatusBadgeStyles,
  bookingStatusLabels,
} from "@/lib/booking-ui";
import { BookingStatus } from "@/lib/booking-status";
import { cn } from "@/lib/utils";
import type { EducatorBookingItem } from "@/types/educator-booking";

type ReservationDetailViewProps = {
  booking: EducatorBookingItem;
};

function formatReservationDateLong(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(utc);
}

export function ReservationDetailView({ booking }: ReservationDetailViewProps) {
  const router = useRouter();
  const [report, setReport] = useState(booking.postSessionReport ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const readOnly = booking.status === BookingStatus.CANCELLED;

  async function saveReport(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    const trimmed = report.trim();
    if (!trimmed) {
      setError("Le compte-rendu ne peut pas être vide.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateBookingReport({
      bookingId: booking.id,
      report: trimmed,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/reservations"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          ← Retour aux réservations
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{booking.dogName}</CardTitle>
              <CardDescription className="mt-1">
                {booking.serviceTitle} · {booking.ownerName}
                {" · "}
                <Link
                  href={`/dashboard/chiens/${booking.dogId}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Fiche chien
                </Link>
              </CardDescription>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                bookingStatusBadgeStyles[booking.status],
              )}
            >
              {bookingStatusLabels[booking.status]}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium capitalize text-foreground">
                {formatReservationDateLong(booking.dateParis)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Horaire</dt>
              <dd className="font-medium text-foreground">
                {booking.timeParis} ({booking.durationMinutes} min)
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Lieu</dt>
              <dd className="font-medium text-foreground">{booking.location}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tarif</dt>
              <dd className="font-medium text-foreground">
                {formatPriceEurosFromCents(booking.priceCents)}
              </dd>
            </div>
          </dl>
          {!readOnly ? (
            <BookingStatusActions
              bookingId={booking.id}
              status={booking.status}
            />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compte-rendu de réservation</CardTitle>
          <CardDescription>
            {readOnly
              ? "Cette réservation est annulée ; le compte-rendu n’est plus modifiable."
              : "Visible pour vous uniquement. Décrivez le déroulé, les progrès et les exercices à refaire."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readOnly && !booking.postSessionReport ? (
            <p className="text-sm text-muted-foreground">
              Aucun compte-rendu enregistré.
            </p>
          ) : (
            <form onSubmit={(e) => void saveReport(e)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reservation-report">Notes</Label>
                <textarea
                  id="reservation-report"
                  value={report}
                  onChange={(e) => {
                    setReport(e.target.value);
                    setSaved(false);
                  }}
                  readOnly={readOnly}
                  rows={10}
                  maxLength={20_000}
                  placeholder="Ex. : Travail sur la marche en laisse, bonne concentration…"
                  className="flex min-h-[160px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              {saved ? (
                <p className="text-sm text-primary">Compte-rendu enregistré.</p>
              ) : null}
              {!readOnly ? (
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Enregistrer le compte-rendu"
                  )}
                </Button>
              ) : null}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
