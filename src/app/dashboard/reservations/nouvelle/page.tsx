import { getEducatorManualBookingFormData } from "@/actions/educator-manual-booking";
import { EducatorManualBookingForm } from "@/components/dashboard/educator-manual-booking-form";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardNewReservationPage() {
  const formResult = await getEducatorManualBookingFormData();

  return (
    <>
      <Topbar
        eyebrow="Planning"
        title="Nouvelle réservation"
        actionLabel="Agenda"
        actionShortLabel="Agenda"
        actionHref="/dashboard/agenda"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        {!formResult.success ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {formResult.error}
          </p>
        ) : (
          <EducatorManualBookingForm {...formResult.data} />
        )}
      </main>
    </>
  );
}
