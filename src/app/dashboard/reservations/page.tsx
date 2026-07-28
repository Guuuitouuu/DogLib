import {
  getEducatorBookingSummary,
  listEducatorBookings,
} from "@/actions/educator-bookings";
import { ReservationsList } from "@/components/dashboard/reservations-list";
import { Topbar } from "@/components/dashboard/topbar";
import { getParisMonthBoundsUtc } from "@/lib/paris-time";

export default async function DashboardReservationsPage() {
  const { startUtc, endUtc } = getParisMonthBoundsUtc();
  const [listResult, summaryResult] = await Promise.all([
    listEducatorBookings({
      startUtcIso: startUtc.toISOString(),
      endUtcIso: endUtc.toISOString(),
      status: "all",
    }),
    getEducatorBookingSummary(),
  ]);

  const loadError =
    (!listResult.success && listResult.error) ||
    (!summaryResult.success && summaryResult.error);

  return (
    <>
      <Topbar
        eyebrow="Historique & suivi"
        title="Vos réservations"
        actionLabel="Agenda"
        actionShortLabel="Agenda"
        actionHref="/dashboard/agenda"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        {loadError ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {loadError}
          </p>
        ) : null}
        <ReservationsList
          bookings={listResult.success ? listResult.data : []}
          summary={summaryResult.success ? summaryResult.data : null}
        />
      </main>
    </>
  );
}
