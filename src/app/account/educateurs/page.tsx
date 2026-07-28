import Link from "next/link";
import { notFound } from "next/navigation";

import { searchMarketplaceEducators } from "@/actions/marketplace";
import { getClientLocation } from "@/actions/client-profile";
import { ClientNearbyEducatorsMapLazy } from "@/components/client/client-nearby-educators-map-lazy";
import { EducatorMarketplaceCard } from "@/components/marketplace/educator-marketplace-card";
import { buttonVariants } from "@/components/ui/button";

export default async function ClientEducatorsPage() {
  const locationResult = await getClientLocation();
  if (!locationResult.success || !locationResult.data) {
    notFound();
  }

  const loc = locationResult.data;
  const searchResult = await searchMarketplaceEducators({
    nearLat: loc.lat,
    nearLng: loc.lng,
    maxRadiusKm: 80,
  });

  const educators = searchResult.success ? searchResult.data : [];

  return (
    <div className="w-full min-w-0 space-y-8">
      <div className="min-w-0">
        <p className="break-words text-sm text-muted-foreground">
          Depuis {loc.address}, {loc.zipCode} {loc.city} — déplacez la carte
          pour élargir la zone.
        </p>
        <Link
          href="/account/profil"
          className={buttonVariants({ variant: "link", className: "mt-2 h-auto px-0" })}
        >
          Modifier mon profil / adresse
        </Link>
      </div>

      <ClientNearbyEducatorsMapLazy
        homeLat={loc.lat}
        homeLng={loc.lng}
        homeLabel={`${loc.address}, ${loc.zipCode} ${loc.city}`}
        initialEducators={educators}
        maxRadiusKm={80}
      />

      {!searchResult.success ? (
        <p className="text-sm text-destructive">{searchResult.error}</p>
      ) : null}

      {educators.length === 0 && searchResult.success ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          Aucun éducateur avec services actifs dans ce rayon. Essayez{" "}
          <Link href="/recherche" className="text-primary underline-offset-4 hover:underline">
            la recherche nationale
          </Link>
          .
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">Liste</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {educators.map((educator) => (
              <EducatorMarketplaceCard key={educator.id} educator={educator} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
