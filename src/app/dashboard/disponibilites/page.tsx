import { EducatorAvailabilityPanel } from "@/components/dashboard/educator-availability-panel";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardDisponibilitesPage() {
  return (
    <>
      <Topbar
        eyebrow="Réservations en ligne"
        title="Vos disponibilités"
        actionLabel="Ajouter une plage"
        actionShortLabel="Plage"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <EducatorAvailabilityPanel />
      </main>
    </>
  );
}
