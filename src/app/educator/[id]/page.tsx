import Link from "next/link";
import { notFound } from "next/navigation";

import { getEducatorPublicProfile } from "@/actions/booking";
import { EducatorPublicServices } from "@/components/educator/educator-public-services";
import { EducatorPublicHeader } from "@/components/educator/educator-public-view";
import { MarketplaceSiteHeader } from "@/components/marketplace/marketplace-site-header";
import { buttonVariants } from "@/components/ui/button";
import { getPublicNavContext } from "@/lib/public-nav";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EducatorPublicPage({ params }: PageProps) {
  const { id } = await params;
  const [result, nav] = await Promise.all([
    getEducatorPublicProfile(id),
    getPublicNavContext(),
  ]);

  if (!result.success) {
    notFound();
  }

  const profile = result.data;

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
            href="/recherche"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Tous les éducateurs
          </Link>
        </div>
      </div>
      <EducatorPublicHeader
        name={profile.educatorName}
        city={profile.city}
        address={profile.address}
        zipCode={profile.zipCode}
        bio={profile.bio}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-8 md:px-8">
        <EducatorPublicServices
          educatorProfileId={profile.id}
          services={profile.services}
        />
      </main>
    </div>
  );
}
