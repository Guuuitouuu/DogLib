import Link from "next/link";
import { ChevronRight, Mail, Phone } from "lucide-react";

import type { EducatorClientListItem } from "@/types/educator-client";

type ClientsListProps = {
  clients: EducatorClientListItem[];
};

function formatShortParisDate(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "short",
  }).format(utc);
}

function formatNextLabel(client: EducatorClientListItem): string {
  if (!client.nextBookingDateParis || !client.nextBookingTimeParis) {
    return "—";
  }
  return `${formatShortParisDate(client.nextBookingDateParis)} · ${client.nextBookingTimeParis}`;
}

export function ClientsList({ clients }: ClientsListProps) {
  const preview = clients.slice(0, 5);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Vos clients
          </h2>
          <p className="text-sm text-muted-foreground">
            Propriétaires et chiens ayant réservé avec vous
          </p>
        </div>
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-1 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          Tout voir
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {preview.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Aucun client pour le moment. Les réservations (y compris celles créées
          manuellement) apparaîtront ici.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col divide-y divide-border">
          {preview.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/chiens/${c.dogId}`}
                className="flex items-center gap-4 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-secondary/30 -mx-2 rounded-xl px-2"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {c.dogName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.dogName}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {c.breed ?? "Race non renseignée"}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.ownerName}
                    {c.lastServiceTitle ? ` — ${c.lastServiceTitle}` : ""}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="size-3" aria-hidden />
                      {c.email}
                    </span>
                    {c.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3" aria-hidden />
                        {c.phone}
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="hidden w-36 shrink-0 sm:block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Suivi
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {c.completionPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{ width: `${c.completionPercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {c.completedReservationsCount}/{c.reservationsCount} terminée
                    {c.reservationsCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="hidden w-28 shrink-0 text-right md:block">
                  <p className="text-xs text-muted-foreground">Prochaine</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatNextLabel(c)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
