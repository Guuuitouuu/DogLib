"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Mail, Phone } from "lucide-react";

import type { EducatorClientListItem } from "@/types/educator-client";

type ClientsTableProps = {
  clients: EducatorClientListItem[];
};

function formatShortParisDate(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(utc);
}

function formatNextLabel(client: EducatorClientListItem): string {
  if (!client.nextBookingDateParis || !client.nextBookingTimeParis) {
    return "—";
  }
  return `${formatShortParisDate(client.nextBookingDateParis)} · ${client.nextBookingTimeParis}`;
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.ownerName.toLowerCase().includes(q) ||
        c.dogName.toLowerCase().includes(q) ||
        (c.breed?.toLowerCase().includes(q) ?? false) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone?.includes(q) ?? false) ||
        (c.lastServiceTitle?.toLowerCase().includes(q) ?? false),
    );
  }, [clients, query]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client…"
          aria-label="Rechercher un client"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span className="col-span-4">Client</span>
          <span className="col-span-2">Contact</span>
          <span className="col-span-2">Dernier service</span>
          <span className="col-span-2">Suivi</span>
          <span className="col-span-2 text-right">Prochaine réservation</span>
        </div>

        {clients.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun client enregistré. Créez une réservation pour qu&apos;un
            propriétaire apparaisse ici.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-1 gap-4 px-5 py-4 transition-colors hover:bg-secondary/40 md:grid-cols-12 md:items-center"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <Link
                    href={`/dashboard/chiens/${c.dogId}`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    {c.dogName.slice(0, 2).toUpperCase()}
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/chiens/${c.dogId}`}
                      className="truncate text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {c.ownerName}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.dogName} · {c.breed ?? "Race non renseignée"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.reservationsCount} réservation
                      {c.reservationsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 space-y-1 text-xs text-muted-foreground">
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-1.5 truncate hover:text-foreground"
                  >
                    <Mail className="size-3.5 shrink-0" aria-hidden />
                    {c.email}
                  </a>
                  {c.phone ? (
                    <a
                      href={`tel:${c.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Phone className="size-3.5 shrink-0" aria-hidden />
                      {c.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/80">—</span>
                  )}
                </div>

                <div className="col-span-2">
                  <span className="inline-flex max-w-full truncate rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                    {c.lastServiceTitle ?? "—"}
                  </span>
                </div>

                <div className="col-span-2">
                  <div className="mb-1 flex items-center justify-between text-xs md:justify-start md:gap-2">
                    <span className="font-semibold text-primary">
                      {c.completionPercent}%
                    </span>
                    <span className="text-muted-foreground">
                      {c.completedReservationsCount}/{c.reservationsCount}
                    </span>
                  </div>
                  <div className="h-2 w-full max-w-[160px] overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${c.completionPercent}%` }}
                    />
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-sm font-medium text-foreground">
                    {formatNextLabel(c)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {clients.length > 0 && visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun client ne correspond à votre recherche.
          </p>
        ) : null}
      </div>
    </div>
  );
}
