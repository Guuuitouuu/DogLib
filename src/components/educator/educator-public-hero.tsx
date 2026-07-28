import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import type { EducatorPublicService } from "@/actions/booking";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EducatorPublicHeroProps = {
  educatorProfileId: string;
  name: string;
  city: string;
  address: string;
  zipCode: string;
  bannerUrl: string | null;
  avatarUrl: string | null;
  services: EducatorPublicService[];
  /** Masquer le CTA réservation (ex. éducateur sur sa propre fiche). */
  showReserveCta?: boolean;
};

export function EducatorPublicHero({
  educatorProfileId,
  name,
  city,
  address,
  zipCode,
  bannerUrl,
  avatarUrl,
  services,
  showReserveCta = true,
}: EducatorPublicHeroProps) {
  const locationLabel = `${address}, ${zipCode} ${city}`;
  const avatarIsExternal = avatarUrl?.startsWith("http") ?? false;
  const bannerIsExternal = bannerUrl?.startsWith("http") ?? false;

  const firstService = services[0];
  const reserveHref = firstService
    ? `/educator/${educatorProfileId}/reserver?serviceId=${encodeURIComponent(firstService.id)}`
    : `/educator/${educatorProfileId}#prestations`;

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm">
      <div
        className={cn(
          "relative h-48 w-full overflow-hidden sm:h-56",
          !bannerUrl &&
            "bg-gradient-to-br from-primary/25 via-accent to-chart-3/20",
        )}
      >
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt=""
            fill
            className="object-cover"
            priority
            unoptimized={bannerIsExternal}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
      </div>

      <div className="px-6 pb-8 pt-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center sm:items-start">
            <div
              className={cn(
                "relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-card bg-secondary shadow-lg ring-2 ring-background sm:size-32",
                "-mt-[3.25rem] sm:-mt-[3.75rem]",
              )}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover object-center"
                  unoptimized={avatarIsExternal}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                  {name.trim().charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2 text-center sm:mt-8 sm:text-left">
              <p className="text-sm font-medium text-primary">Éducateur canin</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                {name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Accompagnement comportemental · méthodes bienveillantes
              </p>
              <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                <span>{locationLabel}</span>
              </p>
            </div>
          </div>

          {showReserveCta && services.length > 0 ? (
            <Link
              href={reserveHref}
              className={buttonVariants({
                size: "lg",
                className: "shrink-0 rounded-xl px-5 font-semibold",
              })}
            >
              Réserver une séance
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
