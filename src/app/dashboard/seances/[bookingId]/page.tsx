import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function DashboardReservationDetailLegacyRedirectPage({
  params,
}: PageProps) {
  const { bookingId } = await params;
  redirect(`/dashboard/reservations/${bookingId}`);
}
