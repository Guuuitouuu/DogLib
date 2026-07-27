import Link from "next/link";
import { notFound } from "next/navigation";

import { getEducatorBookingById } from "@/actions/educator-bookings";
import { SessionDetailView } from "@/components/dashboard/session-detail-view";
import { Topbar } from "@/components/dashboard/topbar";

type PageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function DashboardSessionDetailPage({ params }: PageProps) {
  const { bookingId } = await params;
  const result = await getEducatorBookingById({ bookingId });

  if (!result.success) {
    notFound();
  }

  return (
    <>
      <Topbar
        eyebrow="Détail séance"
        title={result.data.dogName}
        actionLabel="Agenda"
        actionShortLabel="Agenda"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <SessionDetailView booking={result.data} />
      </main>
    </>
  );
}
