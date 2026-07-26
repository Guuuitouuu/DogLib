import { EducatorServicesPanel } from "@/components/dashboard/educator-services-panel";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardServicesPage() {
  return (
    <>
      <Topbar
        eyebrow="Offre & tarifs"
        title="Vos services"
        actionLabel="Nouveau service"
        actionShortLabel="Service"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <EducatorServicesPanel />
      </main>
    </>
  );
}
