import Link from "next/link";
import { notFound } from "next/navigation";

import { getEducatorPublicProfile } from "@/actions/booking";
import {
  EducatorPublicAboutSection,
  EducatorPublicEducatedDogsSection,
  EducatorPublicGallerySection,
  EducatorPublicMapSection,
  EducatorPublicPersonalDogsSection,
} from "@/components/educator/educator-public-profile-sections";
import { EducatorPublicHero } from "@/components/educator/educator-public-hero";
import { EducatorPublicServices } from "@/components/educator/educator-public-services";
import { MarketplaceSiteHeader } from "@/components/marketplace/marketplace-site-header";
import { buttonVariants } from "@/components/ui/button";
import { getPublicNavContext } from "@/lib/public-nav";
import { resolveEducatorPublicBackLink } from "@/lib/role-routes";
import { Role } from "@/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
};

function isEducatorNotFoundError(error: string): boolean {
  return (
    error === "Éducateur introuvable." ||
    error === "Profil invalide."
  );
}

export default async function EducatorPublicPage({ params }: PageProps) {
  const { id } = await params;
  const [result, nav] = await Promise.all([
    getEducatorPublicProfile(id),
    getPublicNavContext(),
  ]);

  if (!result.success) {
    if (isEducatorNotFoundError(result.error)) {
      notFound();
    }

    return (
      <div className="flex min-h-full flex-col bg-background">
        <MarketplaceSiteHeader
          userId={nav.userId}
          spaceHref={nav.spaceHref}
          spaceLabel={nav.spaceLabel}
        />
        <main className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-5 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground">
            Page temporairement indisponible
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Si vous venez de mettre à jour l&apos;application, redémarrez le
            serveur de développement (
            <code className="rounded bg-muted px-1">npm run dev</code>
            ).
          </p>
          <Link
            href="/recherche"
            className={buttonVariants({ className: "mt-6" })}
          >
            Retour à la recherche
          </Link>
        </main>
      </div>
    );
  }

  const profile = result.data;
  const avatarUrl =
    profile.profilePhotoUrl?.trim() || profile.clerkPhotoUrl || null;
  const locationLabel = `${profile.address}, ${profile.zipCode} ${profile.city}`;

  const isOwnPublicProfile =
    nav.role === Role.EDUCATOR && nav.educatorProfileId === profile.id;
  const backLink = resolveEducatorPublicBackLink({
    viewedEducatorProfileId: profile.id,
    viewerRole: nav.role,
    viewerEducatorProfileId: nav.educatorProfileId,
  });

  return (
    <div className="flex min-h-full flex-col bg-background">
      <MarketplaceSiteHeader
        userId={nav.userId}
        spaceHref={nav.spaceHref}
        spaceLabel={nav.spaceLabel}
      />
      <div className="border-b border-border px-5 py-3 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 text-sm">
          <Link
            href={backLink.href}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {backLink.label}
          </Link>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 py-8 md:px-8">
        <EducatorPublicHero
          educatorProfileId={profile.id}
          name={profile.educatorName}
          city={profile.city}
          address={profile.address}
          zipCode={profile.zipCode}
          bannerUrl={profile.bannerUrl}
          avatarUrl={avatarUrl}
          services={profile.services}
          showReserveCta={!isOwnPublicProfile}
        />
        <EducatorPublicAboutSection bio={profile.bio} />
        <EducatorPublicGallerySection galleryUrls={profile.galleryUrls} />
        <EducatorPublicPersonalDogsSection dogs={profile.personalDogs} />
        <EducatorPublicEducatedDogsSection dogs={profile.educatedDogs} />
        <EducatorPublicServices
          educatorProfileId={profile.id}
          services={profile.services}
          showReserveActions={!isOwnPublicProfile}
        />
        <EducatorPublicMapSection
          showLocationMap={profile.showLocationMap}
          lat={profile.lat}
          lng={profile.lng}
          locationLabel={locationLabel}
          educatorName={profile.educatorName}
        />
      </main>
    </div>
  );
}
