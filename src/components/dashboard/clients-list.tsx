import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { EducatorClientItem } from "@/types/educator-client";

type ClientsListProps = {
  clients: EducatorClientItem[];
};

export function ClientsList({ clients }: ClientsListProps) {
  const visible = clients.slice(0, 5);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Suivi des élèves
          </h2>
          <p className="text-sm text-muted-foreground">
            Chiens suivis via vos réservations
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

      {visible.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Aucun client pour le moment. Les réservations apparaîtront ici.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col divide-y divide-border">
          {visible.map((c) => (
            <li key={c.id}>
              <Link
                href={c.nextSessionHref ?? `/dashboard/chiens/${c.dogId}`}
                className="flex items-center gap-4 py-3.5 transition-colors hover:bg-secondary/30 first:pt-0 last:pb-0"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary">
                  {c.dogName.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.dogName}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {c.breed ?? "Race non renseignée"}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.ownerName} — {c.program}
                  </p>
                </div>

                <div className="hidden w-36 shrink-0 sm:block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Progression
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {c.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>

                <div className="hidden w-28 shrink-0 text-right md:block">
                  <p className="text-xs text-muted-foreground">Prochaine</p>
                  <p className="text-sm font-semibold text-foreground">
                    {c.nextSessionLabel}
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
