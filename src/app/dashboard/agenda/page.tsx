import { EducatorAgendaPanel } from "@/components/dashboard/educator-agenda-panel";
import { Topbar } from "@/components/dashboard/topbar";
import {
  listEducatorBookingsForDay,
  listEducatorBookingsForWeek,
} from "@/actions/educator-bookings";
import { toParisDateString } from "@/lib/paris-time";

export default async function DashboardAgendaPage() {
  const todayParis = toParisDateString(new Date());
  const [weekResult, dayResult] = await Promise.all([
    listEducatorBookingsForWeek(0, "all"),
    listEducatorBookingsForDay(todayParis, "all"),
  ]);

  const loadError =
    (!weekResult.success && weekResult.error) ||
    (!dayResult.success && dayResult.error);

  const week = weekResult.success
    ? weekResult.data.week
    : { weekStartDateStr: todayParis, days: [] };
  const weekBookings = weekResult.success ? weekResult.data.bookings : [];
  const dayBookings = dayResult.success ? dayResult.data : [];

  return (
    <>
      <Topbar
        eyebrow="Planning"
        title="Votre agenda"
        actionLabel="Disponibilités"
        actionShortLabel="Dispo"
        actionHref="/dashboard/disponibilites"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        {loadError ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {loadError}
          </p>
        ) : null}
        <EducatorAgendaPanel
          initialWeek={{
            weekStartDateStr: week.weekStartDateStr,
            days: week.days,
          }}
          initialWeekBookings={weekBookings}
          initialDayParis={todayParis}
          initialDayBookings={dayBookings}
        />
      </main>
    </>
  );
}
