import { notFound } from "next/navigation";

import { getEducatorProfileSettings } from "@/actions/educator-profile";
import { EducatorSettingsPanel } from "@/components/dashboard/educator-settings-panel";
import { Topbar } from "@/components/dashboard/topbar";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function DashboardParametresPage() {
  const result = await getEducatorProfileSettings();

  if (!result.success) {
    notFound();
  }

  return (
    <>
      <Topbar eyebrow="Compte éducateur" title="Paramètres" />
      <main className="flex-1 space-y-6 px-5 py-6 md:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="text-sm text-muted-foreground">
            Personnalisez l&apos;apparence de votre fiche (bannière, photos,
            carte) depuis{" "}
            <Link
              href="/dashboard/fiche-publique"
              className={buttonVariants({
                variant: "link",
                className: "h-auto p-0 font-semibold",
              })}
            >
              Ma fiche publique
            </Link>
            .
          </p>
          <EducatorSettingsPanel profile={result.data} />
        </div>
      </main>
    </>
  );
}
