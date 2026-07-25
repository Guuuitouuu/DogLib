import { ClientsList } from "@/components/dashboard/clients-list";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TasksPanel } from "@/components/dashboard/tasks-panel";
import { Topbar } from "@/components/dashboard/topbar";
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions";

export default function DashboardPage() {
  return (
    <>
      <Topbar />
      <main className="flex-1 space-y-6 px-5 py-6 md:px-8">
        <StatCards />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <UpcomingSessions />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ClientsList />
          </div>
          <div className="lg:col-span-1">
            <TasksPanel />
          </div>
        </div>
      </main>
    </>
  );
}
