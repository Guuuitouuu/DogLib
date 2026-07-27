import { EducatorServicesPanel } from "@/components/dashboard/educator-services-panel";
import { Topbar } from "@/components/dashboard/topbar";
import { listEducatorServices } from "@/actions/educator-services";

export default async function DashboardServicesPage() {
  const listResult = await listEducatorServices();

  return (
    <>
      <Topbar
        eyebrow="Offre & tarifs"
        title="Vos services"
        actionLabel="Nouveau service"
        actionShortLabel="Service"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <EducatorServicesPanel
          initialServices={listResult.success ? listResult.data : []}
          initialListError={
            listResult.success ? null : listResult.error
          }
        />
      </main>
    </>
  );
}
