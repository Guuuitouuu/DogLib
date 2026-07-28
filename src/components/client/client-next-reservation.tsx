import Link from "next/link";
import { ChevronRight, Clock, GraduationCap, MapPin } from "lucide-react";

import { ClientCancelBookingButton } from "@/components/client/client-cancel-booking-button";
import { buttonVariants } from "@/components/ui/button";
import {
  formatLongParisDate,
  formatNextReservationTimeRange,
} from "@/lib/client-dashboard-home";
import { cn } from "@/lib/utils";
import type { ClientBookingItem } from "@/types/client-dashboard";

type ClientNextReservationProps = {
  booking: ClientBookingItem | null;
};

export function ClientNextReservation({ booking }: ClientNextReservationProps) {
  return (
    <section className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Prochaine réservation
        </h2>
        <Link
          href="/account/reservations"
          className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Toutes
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {!booking ? (
        <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
          <p className="text-sm text-muted-foreground">
            Aucune réservation à venir pour le moment.
          </p>
          <Link
            href="/account/educateurs"
            className={cn(buttonVariants(), "mt-4 w-full")}
          >
            Trouver un éducateur
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-2xl bg-accent p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/70">
              {formatLongParisDate(booking.dateParis)}
            </p>
            <p className="mt-1 text-base font-bold text-accent-foreground">
              {booking.serviceTitle}
            </p>
            <p className="mt-0.5 text-sm text-accent-foreground/90">
              {booking.dogName}
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-accent-foreground/90">
              <span className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                {formatNextReservationTimeRange(booking)}
              </span>
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 break-words">{booking.location}</span>
              </span>
              <span className="flex items-center gap-2">
                <GraduationCap className="size-4 shrink-0" />
                avec {booking.educatorName}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href={`/educator/${booking.educatorProfileId}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto min-h-10 whitespace-normal py-2.5 text-center",
              )}
            >
              Fiche éducateur
            </Link>
            {booking.canCancel ? (
              <ClientCancelBookingButton
                bookingId={booking.id}
                dogName={booking.dogName}
                compact
                className="h-auto min-h-10 w-full whitespace-normal py-2.5"
              />
            ) : (
              <p className="flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-center text-xs text-muted-foreground">
                {booking.cancelBlockedReason ??
                  "Annulation indisponible pour ce créneau."}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
