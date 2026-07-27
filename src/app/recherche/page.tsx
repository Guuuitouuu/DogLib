import Link from "next/link";

import {
  getMarketplaceFilterOptions,
  searchMarketplaceEducators,
} from "@/actions/marketplace";
import { EducatorMarketplaceCard } from "@/components/marketplace/educator-marketplace-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { MarketplaceSiteHeader } from "@/components/marketplace/marketplace-site-header";
import { buttonVariants } from "@/components/ui/button";
import { getPublicNavContext } from "@/lib/public-nav";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    city?: string;
    specialty?: string;
  }>;
};

export default async function RecherchePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const city = params.city?.trim() ?? "";
  const specialty = params.specialty?.trim() ?? "";

  const [filtersResult, searchResult, nav] = await Promise.all([
    getMarketplaceFilterOptions(),
    searchMarketplaceEducators({ q, city, specialty }),
    getPublicNavContext(),
  ]);

  const educators = searchResult.success ? searchResult.data : [];
  const filterOptions = filtersResult.success
    ? filtersResult.data
    : { cities: [], specialties: [] };

  let spaceHref = nav.spaceHref;
  let spaceLabel = nav.spaceLabel;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <MarketplaceSiteHeader
        userId={nav.userId}
        spaceHref={spaceHref}
        spaceLabel={spaceLabel}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-5 py-10 md:px-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Trouver un éducateur
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Parcourez les profils publics, filtrez par ville ou par type de
            service, puis consultez la fiche avant de réserver.
          </p>
        </div>

        <MarketplaceFilters
          options={filterOptions}
          initialQ={q}
          initialCity={city}
          initialSpecialty={specialty}
        />

        {!searchResult.success ? (
          <p className="text-sm text-destructive" role="alert">
            {searchResult.error}
          </p>
        ) : null}

        {educators.length === 0 && searchResult.success ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="font-medium text-foreground">Aucun éducateur trouvé</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Essayez d&apos;élargir votre recherche ou de retirer des filtres.
            </p>
            <Link
              href="/recherche"
              className={buttonVariants({ variant: "outline", className: "mt-4" })}
            >
              Voir tous les éducateurs
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {educators.map((educator) => (
              <EducatorMarketplaceCard key={educator.id} educator={educator} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
