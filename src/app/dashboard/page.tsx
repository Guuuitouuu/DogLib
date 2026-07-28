import {
  getMonthlyStats,
  getTodayBookings,
} from "@/actions/educator";
import { listEducatorClients } from "@/actions/educator-clients";
import { listEducatorMemos } from "@/actions/educator-memos";
import { ClientsList } from "@/components/dashboard/clients-list";
import { MemosPanel } from "@/components/dashboard/memos-panel";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { Topbar } from "@/components/dashboard/topbar";
import { UpcomingReservations } from "@/components/dashboard/upcoming-reservations";

export default async function DashboardPage() {
  const [bookingsResult, statsResult, memosResult, clientsResult] =
    await Promise.all([
    getTodayBookings(),
    getMonthlyStats(),
    listEducatorMemos(),
    listEducatorClients(),
  ]);

  const bookings = bookingsResult.success ? bookingsResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;

  const loadError =
    (!bookingsResult.success && bookingsResult.error) ||
    (!statsResult.success && statsResult.error);

  const memos = memosResult.success ? memosResult.data : [];
  const memosError = memosResult.success ? null : memosResult.error;
  const clients = clientsResult.success ? clientsResult.data : [];

  return (
    <>
      <Topbar eyebrow="Bonjour 👋" title="Voici votre journée" actionHref="/dashboard/reservations/nouvelle" />
      <main className="flex-1 space-y-6 px-5 py-6 md:px-8">
        {loadError ? (
          <p
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {loadError}
          </p>
        ) : null}

        <StatCards stats={stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <UpcomingReservations bookings={bookings} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ClientsList clients={clients} />
          </div>
          <div className="lg:col-span-1">
            <MemosPanel initialMemos={memos} initialError={memosError} />
          </div>
        </div>
      </main>
    </>
  );
}
