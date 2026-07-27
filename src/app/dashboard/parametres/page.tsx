import { notFound } from "next/navigation";

import { getEducatorProfileSettings } from "@/actions/educator-profile";
import { EducatorSettingsPanel } from "@/components/dashboard/educator-settings-panel";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardParametresPage() {
  const result = await getEducatorProfileSettings();

  if (!result.success) {
    notFound();
  }

  return (
    <>
      <Topbar eyebrow="Compte éducateur" title="Paramètres" />
      <main className="flex-1 px-5 py-6 md:px-8">
        <EducatorSettingsPanel profile={result.data} />
      </main>
    </>
  );
}
