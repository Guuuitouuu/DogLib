import Link from "next/link";
import { Clock } from "lucide-react";

import type { EducatorPublicService } from "@/actions/booking";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPriceEurosFromCents } from "@/lib/format-price";

type EducatorPublicServicesProps = {
  educatorProfileId: string;
  services: EducatorPublicService[];
};

export function EducatorPublicServices({
  educatorProfileId,
  services,
}: EducatorPublicServicesProps) {
  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Cet éducateur n&apos;a pas encore publié de services actifs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Tarifs et durées des séances proposées par cet éducateur.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.map((service) => (
          <article
            key={service.id}
            className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground">{service.title}</h3>
                <Badge variant="secondary">
                  {formatPriceEurosFromCents(service.priceCents)}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                {service.durationMinutes} min
              </p>
              {service.description ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {service.description}
                </p>
              ) : null}
            </div>
            <Link
              href={`/educator/${educatorProfileId}/reserver?serviceId=${encodeURIComponent(service.id)}`}
              className={buttonVariants({ className: "shrink-0" })}
            >
              Réserver
            </Link>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
