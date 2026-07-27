import Image from "next/image";
import Link from "next/link";
import { MapPin, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDistanceKm } from "@/lib/geo-distance";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MarketplaceEducatorItem } from "@/types/marketplace";

type EducatorMarketplaceCardProps = {
  educator: MarketplaceEducatorItem;
};

export function EducatorMarketplaceCard({
  educator,
}: EducatorMarketplaceCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
          {educator.photoUrl ? (
            <Image
              src={educator.photoUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <UserRound className="size-7" aria-hidden />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-lg leading-tight">{educator.name}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {educator.city}
            </span>
            {educator.distanceKm != null ? (
              <Badge variant="outline">{formatDistanceKm(educator.distanceKm)}</Badge>
            ) : null}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {educator.bio ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {educator.bio}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Bio non renseignée.
          </p>
        )}
        {educator.specialties.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {educator.specialties.map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Link
          href={`/educator/${educator.id}`}
          className={buttonVariants({ className: "w-full" })}
        >
          Voir le profil
        </Link>
      </CardFooter>
    </Card>
  );
}
