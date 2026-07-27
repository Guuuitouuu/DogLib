import { getEducatorBillingOverview } from "@/actions/educator-billing";
import { BillingTable } from "@/components/dashboard/billing-table";
import { Topbar } from "@/components/dashboard/topbar";
import { formatParisDayLabel } from "@/lib/paris-time";

export default async function DashboardFacturationPage() {
  const result = await getEducatorBillingOverview();
  const overview = result.success
    ? result.data
    : {
        invoices: [],
        totalCents: 0,
        paidCents: 0,
        pendingCents: 0,
        lateCents: 0,
      };

  return (
    <>
      <Topbar eyebrow={formatParisDayLabel()} title="Votre facturation" />
      <main className="flex-1 px-5 py-6 md:px-8">
        {!result.success ? (
          <p
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {result.error}
          </p>
        ) : null}
        <BillingTable overview={overview} />
      </main>
    </>
  );
}
