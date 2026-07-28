import Link from "next/link";
import { notFound } from "next/navigation";

import { getEducatorPublicProfile } from "@/actions/booking";
import { getEducatorProfileSettings } from "@/actions/educator-profile";
import { listEducatorPersonalDogs } from "@/actions/educator-personal-dogs";
import { EducatorFicheEducatedDogsHintPanel } from "@/components/dashboard/educator-fiche-educated-dogs-hint-panel";
import { EducatorFichePubliquePreview } from "@/components/dashboard/educator-fiche-publique-preview";
import { EducatorFicheServicesHintPanel } from "@/components/dashboard/educator-fiche-services-hint-panel";
import { EducatorPersonalDogsPanel } from "@/components/dashboard/educator-personal-dogs-panel";
import { EducatorProfileAppearancePanel } from "@/components/dashboard/educator-profile-appearance-panel";
import { EducatorPublicFicheBioPanel } from "@/components/dashboard/educator-public-fiche-bio-panel";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardFichePubliquePage() {
  const settingsResult = await getEducatorProfileSettings();

  if (!settingsResult.success) {
    notFound();
  }

  const profile = settingsResult.data;
  const publicUrl = `/educator/${profile.educatorProfileId}`;

  const publicResult = await getEducatorPublicProfile(profile.educatorProfileId);
  if (!publicResult.success) {
    notFound();
  }

  const personalDogsResult = await listEducatorPersonalDogs();
  const personalDogs = personalDogsResult.success ? personalDogsResult.data : [];

  const publicProfile = publicResult.data;

  return (
    <>
      <Topbar
        eyebrow="Visibilité"
        title="Ma fiche publique"
        actionLabel="Voir la fiche"
        actionShortLabel="Aperçu"
        actionHref={publicUrl}
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Personnalisez la page que les propriétaires voient avant de
            réserver. Les sections ci-dessous reprennent le même ordre que la{" "}
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              fiche publique
            </Link>
            .
          </p>

          <EducatorFichePubliquePreview
            publicProfile={publicProfile}
            publicUrl={publicUrl}
          />

          <EducatorProfileAppearancePanel profile={profile} />
          <EducatorPublicFicheBioPanel profile={profile} />
          <EducatorPersonalDogsPanel initialDogs={personalDogs} embedded />
          <EducatorFicheEducatedDogsHintPanel
            educatedDogsCount={publicProfile.educatedDogs.length}
          />
          <EducatorFicheServicesHintPanel
            activeServicesCount={publicProfile.services.length}
          />
        </div>
      </main>
    </>
  );
}
