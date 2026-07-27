import { getEducatorClients } from "@/actions/educator-clients";
import { ClientsTable } from "@/components/dashboard/clients-table";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardClientsPage() {
  const result = await getEducatorClients();
  const clients = result.success ? result.data : [];

  return (
    <>
      <Topbar
        eyebrow={
          result.success
            ? `${clients.length} élève${clients.length === 1 ? "" : "s"}`
            : "Clients"
        }
        title="Vos clients"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        {!result.success ? (
          <p
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {result.error}
          </p>
        ) : null}
        <ClientsTable clients={clients} />
      </main>
    </>
  );
}
