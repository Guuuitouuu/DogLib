import { Topbar } from "@/components/dashboard/topbar";
import { BillingTable } from "@/components/dashboard/billing-table";

export default function DashboardFacturationPage() {
  return (
    <>
      <Topbar
        eyebrow="Juillet 2026"
        title="Votre facturation"
        actionLabel="Créer une facture"
        actionShortLabel="Facture"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <BillingTable />
      </main>
    </>
  );
}
