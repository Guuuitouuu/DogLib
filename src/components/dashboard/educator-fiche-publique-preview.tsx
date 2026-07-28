import Link from "next/link";
import { ExternalLink } from "lucide-react";

import type { EducatorPublicProfile } from "@/actions/booking";
import { EducatorPublicHero } from "@/components/educator/educator-public-hero";
import { EducatorFicheSectionCard } from "@/components/dashboard/educator-fiche-section-card";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  publicProfile: EducatorPublicProfile;
  publicUrl: string;
};

export function EducatorFichePubliquePreview({
  publicProfile,
  publicUrl,
}: Props) {
  const avatarUrl =
    publicProfile.profilePhotoUrl?.trim() ||
    publicProfile.clerkPhotoUrl ||
    null;

  return (
    <EducatorFicheSectionCard
      title="Aperçu de la vitrine"
      description="Rendu actuel de l’en-tête de votre fiche publique."
      contentClassName="space-y-4"
    >
      <div className="pointer-events-none select-none opacity-[0.98]">
        <EducatorPublicHero
          educatorProfileId={publicProfile.id}
          name={publicProfile.educatorName}
          city={publicProfile.city}
          address={publicProfile.address}
          zipCode={publicProfile.zipCode}
          bannerUrl={publicProfile.bannerUrl}
          avatarUrl={avatarUrl}
          services={publicProfile.services}
        />
      </div>
      <Link
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ className: "w-full rounded-xl sm:w-auto" })}
      >
        Ouvrir la fiche publique
        <ExternalLink className="size-4" aria-hidden />
      </Link>
    </EducatorFicheSectionCard>
  );
}
