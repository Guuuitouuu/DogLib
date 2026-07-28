import { notFound } from "next/navigation";

import { getClientBookingsOverview } from "@/actions/client-bookings";
import { ClientBookingsPanel } from "@/components/client/client-bookings-panel";

export default async function ClientReservationsPage() {
  const bookingsResult = await getClientBookingsOverview();
  if (!bookingsResult.success) {
    notFound();
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Réservations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          À venir et historique de vos rendez-vous.
        </p>
      </div>
      <ClientBookingsPanel
        upcoming={bookingsResult.data.upcoming}
        past={bookingsResult.data.past}
      />
    </div>
  );
}
