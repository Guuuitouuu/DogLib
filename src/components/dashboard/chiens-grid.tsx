import Link from "next/link";
import { ChevronRight, FileText, PawPrint, User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { EducatorDogListItem } from "@/types/educator-dog";

type ChiensGridProps = {
  dogs: EducatorDogListItem[];
};

function formatShortDate(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(utc);
}

export function ChiensGrid({ dogs }: ChiensGridProps) {
  if (dogs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <PawPrint className="mx-auto size-10 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-sm font-medium text-foreground">
          Aucun chien pour le moment
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les chiens apparaissent ici dès qu&apos;un client réserve une réservation
          avec vous.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {dogs.map((dog) => (
        <article
          key={dog.id}
          className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <PawPrint className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
                {dog.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {dog.breed ?? "Race non renseignée"}
                {dog.age != null ? ` · ${dog.age} an${dog.age > 1 ? "s" : ""}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
              <User className="size-3.5" aria-hidden />
              {dog.ownerName}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
              <PawPrint className="size-3.5" aria-hidden />
              {dog.reservationsCount} réservation{dog.reservationsCount !== 1 ? "s" : ""}
            </span>
            {dog.reportsCount > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                <FileText className="size-3.5" aria-hidden />
                {dog.reportsCount} compte-rendu{dog.reportsCount !== 1 ? "s" : ""}
              </span>
            ) : null}
          </div>

          {dog.lastReservationDateParis ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Dernière réservation : {formatShortDate(dog.lastReservationDateParis)}
            </p>
          ) : null}

          <Link
            href={`/dashboard/chiens/${dog.id}`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "mt-4 w-full justify-between",
            })}
          >
            Fiche & comptes-rendus
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </article>
      ))}
    </div>
  );
}
