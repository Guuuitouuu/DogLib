import { notFound } from "next/navigation";

import { getEducatorBookingById } from "@/actions/educator-bookings";
import { ReservationDetailView } from "@/components/dashboard/reservation-detail-view";
import { Topbar } from "@/components/dashboard/topbar";

type PageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function DashboardReservationDetailPage({
  params,
}: PageProps) {
  const { bookingId } = await params;
  const result = await getEducatorBookingById({ bookingId });

  if (!result.success) {
    notFound();
  }

  return (
    <>
      <Topbar
        eyebrow="Détail réservation"
        title={result.data.dogName}
        actionLabel="Agenda"
        actionShortLabel="Agenda"
        actionHref="/dashboard/agenda"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <ReservationDetailView booking={result.data} />
      </main>
    </>
  );
}
