import Link from "next/link";
import { Clock } from "lucide-react";

import type { EducatorPublicService } from "@/actions/booking";
import { buttonVariants } from "@/components/ui/button";
import { formatPriceEurosFromCents } from "@/lib/format-price";

type EducatorPublicServicesProps = {
  educatorProfileId: string;
  services: EducatorPublicService[];
  showReserveActions?: boolean;
};

export function EducatorPublicServices({
  educatorProfileId,
  services,
  showReserveActions = true,
}: EducatorPublicServicesProps) {
  if (services.length === 0) {
    return (
      <section
        id="prestations"
        className="rounded-3xl border border-border bg-card p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-foreground">Prestations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cet éducateur n&apos;a pas encore publié de services actifs.
        </p>
      </section>
    );
  }

  return (
    <section
      id="prestations"
      className="rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-bold text-foreground">Prestations</h2>
        <p className="text-sm text-muted-foreground">
          Services proposés à la réservation
        </p>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex flex-col rounded-2xl border border-border p-4"
          >
            <p className="font-bold text-foreground">{service.title}</p>
            {service.description ? (
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            ) : (
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                Durée {service.durationMinutes} minutes
              </p>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                {service.durationMinutes} min
              </span>
              <span className="text-base font-extrabold text-primary">
                {formatPriceEurosFromCents(service.priceCents)}
              </span>
            </div>
            {showReserveActions ? (
              <Link
                href={`/educator/${educatorProfileId}/reserver?serviceId=${encodeURIComponent(service.id)}`}
                className={buttonVariants({
                  className: "mt-4 w-full rounded-xl",
                })}
              >
                Réserver
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
