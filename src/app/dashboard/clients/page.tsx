import { listEducatorClients } from "@/actions/educator-clients";
import { ClientsTable } from "@/components/dashboard/clients-table";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardClientsPage() {
  const result = await listEducatorClients();
  const clients = result.success ? result.data : [];
  const countLabel =
    clients.length > 0
      ? `${new Set(clients.map((c) => c.clientUserId)).size} client${
          new Set(clients.map((c) => c.clientUserId)).size !== 1 ? "s" : ""
        } · ${clients.length} chien${clients.length !== 1 ? "s" : ""} suivi${clients.length !== 1 ? "s" : ""}`
      : "Aucun client pour le moment";

  return (
    <>
      <Topbar
        eyebrow={countLabel}
        title="Vos clients"
        actionLabel="Nouvelle réservation"
        actionShortLabel="Réservation"
        actionHref="/dashboard/reservations/nouvelle"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        {!result.success ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {result.error}
          </p>
        ) : null}
        <ClientsTable clients={clients} />
      </main>
    </>
  );
}
