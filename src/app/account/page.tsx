import { getClientBookingsOverview } from "@/actions/client-bookings";
import { getClientDashboardSummary, listClientDogs } from "@/actions/client-dogs";
import { getClientLocation } from "@/actions/client-profile";
import { searchMarketplaceEducators } from "@/actions/marketplace";
import { ClientDashboardDogSpotlight } from "@/components/client/client-dashboard-dog-spotlight";
import { ClientNearbyEducatorsMapLazy } from "@/components/client/client-nearby-educators-map-lazy";
import { ClientStatCards } from "@/components/client/client-stat-cards";

type PageProps = {
  searchParams: Promise<{ reservation?: string }>;
};

export default async function ClientAccountHomePage({ searchParams }: PageProps) {
  const { reservation } = await searchParams;
  const showBookingSuccess = reservation === "success";

  const [summaryResult, bookingsResult, dogsResult, locationResult] =
    await Promise.all([
      getClientDashboardSummary(),
      getClientBookingsOverview(),
      listClientDogs(),
      getClientLocation(),
    ]);

  const summary = summaryResult.success
    ? summaryResult.data
    : {
        dogsCount: 0,
        totalReservations: 0,
        completedReservations: 0,
        reportsCount: 0,
      };

  const dogs = dogsResult.success ? dogsResult.data : [];
  const nextUpcoming = bookingsResult.success
    ? (bookingsResult.data.upcoming[0] ?? null)
    : null;
  const featuredDog = dogs[0] ?? null;

  const loc = locationResult.success ? locationResult.data : null;
  const educatorsResult =
    loc != null
      ? await searchMarketplaceEducators({
          nearLat: loc.lat,
          nearLng: loc.lng,
          maxRadiusKm: 50,
        })
      : null;
  const mapEducators =
    educatorsResult?.success ? educatorsResult.data : [];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {showBookingSuccess ? (
        <div
          className="break-words rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          Votre demande de réservation a été enregistrée. L&apos;éducateur la
          verra en <strong>attente de confirmation</strong> dans son agenda.
        </div>
      ) : null}

      <ClientStatCards summary={summary} nextUpcoming={nextUpcoming} />

      <ClientDashboardDogSpotlight
        dog={featuredDog}
        dogsCount={summary.dogsCount}
      />

      {loc ? (
        <ClientNearbyEducatorsMapLazy
          homeLat={loc.lat}
          homeLng={loc.lng}
          homeLabel={`${loc.address}, ${loc.zipCode} ${loc.city}`}
          initialEducators={mapEducators}
          maxRadiusKm={50}
        />
      ) : null}
    </div>
  );
}
