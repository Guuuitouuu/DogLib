import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { getEducatorPublicProfile, getMyDogs } from "@/actions/booking";
import { EducatorReservationFlow } from "@/components/educator/educator-reservation-flow";
import { MarketplaceSiteHeader } from "@/components/marketplace/marketplace-site-header";
import { Role } from "@/generated/prisma/client";
import { findAppUserByClerkId } from "@/lib/db-user";
import { getPublicNavContext } from "@/lib/public-nav";
import { buttonVariants } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ serviceId?: string }>;
};

function buildReturnPath(educatorId: string, serviceId?: string): string {
  const query = serviceId
    ? `?serviceId=${encodeURIComponent(serviceId)}`
    : "";
  return `/educator/${educatorId}/reserver${query}`;
}

export default async function EducatorReserverPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { serviceId } = await searchParams;
  const returnPath = buildReturnPath(id, serviceId);

  const { userId } = await auth();
  if (!userId) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(returnPath)}`,
    );
  }

  const appUser = await findAppUserByClerkId(userId);
  if (!appUser) {
    redirect(`/sign-up?redirect_url=${encodeURIComponent(returnPath)}`);
  }
  if (appUser.role === Role.EDUCATOR) {
    redirect("/dashboard");
  }
  if (appUser.role !== Role.CLIENT) {
    redirect("/onboarding");
  }

  const [result, nav, dogsResult] = await Promise.all([
    getEducatorPublicProfile(id),
    getPublicNavContext(),
    getMyDogs(),
  ]);

  if (!result.success) {
    notFound();
  }

  if (serviceId && !result.data.services.some((s) => s.id === serviceId)) {
    notFound();
  }

  const initialDogs = dogsResult.success ? dogsResult.data : [];

  return (
    <div className="flex min-h-full flex-col bg-background">
      <MarketplaceSiteHeader
        userId={nav.userId}
        spaceHref={nav.spaceHref}
        spaceLabel={nav.spaceLabel}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 md:px-8">
        <EducatorReservationFlow
          educatorProfileId={result.data.id}
          educatorName={result.data.educatorName}
          services={result.data.services}
          initialServiceId={serviceId}
          initialDogs={initialDogs}
        />
        <div className="mt-6">
          <Link href="/account" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Mon espace propriétaire
          </Link>
        </div>
      </main>
    </div>
  );
}
