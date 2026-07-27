import { Topbar } from "@/components/dashboard/topbar";
import { ClientsTable } from "@/components/dashboard/clients-table";

export default function DashboardClientsPage() {
  return (
    <>
      <Topbar
        eyebrow="24 clients actifs"
        title="Vos clients"
        actionLabel="Ajouter un client"
        actionShortLabel="Ajouter"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <ClientsTable />
      </main>
    </>
  );
}
