import {
  getMonthlyStats,
  getTodayBookings,
} from "@/actions/educator";
import { getEducatorRevenueHistory } from "@/actions/educator-billing";
import { getEducatorClients } from "@/actions/educator-clients";
import { getEducatorDashboardTasks } from "@/actions/educator-tasks";
import { ClientsList } from "@/components/dashboard/clients-list";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TasksPanel } from "@/components/dashboard/tasks-panel";
import { Topbar } from "@/components/dashboard/topbar";
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions";

export default async function DashboardPage() {
  const [bookingsResult, statsResult, clientsResult, revenueResult, tasksResult] =
    await Promise.all([
      getTodayBookings(),
      getMonthlyStats(),
      getEducatorClients(),
      getEducatorRevenueHistory(6),
      getEducatorDashboardTasks(),
    ]);

  const bookings = bookingsResult.success ? bookingsResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;
  const clients = clientsResult.success ? clientsResult.data : [];
  const revenue = revenueResult.success ? revenueResult.data : [];
  const tasks = tasksResult.success ? tasksResult.data : [];

  const loadError =
    (!bookingsResult.success && bookingsResult.error) ||
    (!statsResult.success && statsResult.error) ||
    (!clientsResult.success && clientsResult.error) ||
    (!revenueResult.success && revenueResult.error) ||
    (!tasksResult.success && tasksResult.error);

  return (
    <>
      <Topbar eyebrow="Bonjour" title="Voici votre journée" />
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
            <RevenueChart months={revenue} />
          </div>
          <div className="lg:col-span-1">
            <UpcomingSessions bookings={bookings} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ClientsList clients={clients} />
          </div>
          <div className="lg:col-span-1">
            <TasksPanel tasks={tasks} />
          </div>
        </div>
      </main>
    </>
  );
}
