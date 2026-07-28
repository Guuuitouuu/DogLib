import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  bookingStatusBadgeStyles,
  bookingStatusLabels,
} from "@/lib/booking-ui";
import type { BookingStatusValue } from "@/lib/booking-status";
import { cn } from "@/lib/utils";
import type { ClientDogDetail } from "@/types/client-dashboard";

type ClientDogReportsViewProps = {
  dog: ClientDogDetail;
};

function formatDateLong(dateParis: string): string {
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

export function ClientDogReportsView({ dog }: ClientDogReportsViewProps) {
  const withReports = dog.reservations.filter(
    (r) => r.postSessionReport && r.postSessionReport.trim().length > 0,
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6">
      <Link
        href="/account/chiens"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        ← Mes chiens
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Comptes-rendus · {dog.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rédigés par vos éducateurs après chaque réservation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique</CardTitle>
          <CardDescription>
            {withReports.length} compte-rendu
            {withReports.length !== 1 ? "s" : ""} disponible
            {withReports.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {withReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun compte-rendu pour le moment. Ils apparaîtront ici dès
              qu&apos;un éducateur en aura rédigé un.
            </p>
          ) : (
            withReports.map((reservation) => {
              const status = reservation.status as BookingStatusValue;
              return (
                <article
                  key={reservation.bookingId}
                  className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold capitalize text-foreground">
                        {formatDateLong(reservation.dateParis)}
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        {reservation.timeParis} · {reservation.serviceTitle}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {reservation.educatorName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        bookingStatusBadgeStyles[status],
                      )}
                    >
                      {bookingStatusLabels[status]}
                    </span>
                  </div>
                  <p className="mt-4 min-w-0 break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {reservation.postSessionReport}
                  </p>
                  <Link
                    href={`/educator/${reservation.educatorProfileId}`}
                    className={buttonVariants({
                      variant: "link",
                      size: "sm",
                      className: "mt-3 h-auto px-0",
                    })}
                  >
                    Voir l&apos;éducateur
                  </Link>
                </article>
              );
            })
          )}
        </CardContent>
      </Card>

      <Link
        href={`/account/chiens/${dog.id}`}
        className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
      >
        Retour à la fiche de {dog.name}
      </Link>
    </div>
  );
}
