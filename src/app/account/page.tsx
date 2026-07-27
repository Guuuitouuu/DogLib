import Link from "next/link";
import { GraduationCap, PawPrint, FileText, CalendarCheck } from "lucide-react";

import { getClientBookingsOverview } from "@/actions/client-bookings";
import { getClientDashboardSummary } from "@/actions/client-dogs";
import { ClientBookingsPanel } from "@/components/client/client-bookings-panel";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<{ reservation?: string }>;
};

export default async function ClientAccountHomePage({ searchParams }: PageProps) {
  const { reservation } = await searchParams;
  const showBookingSuccess = reservation === "success";

  const summaryResult = await getClientDashboardSummary();
  const bookingsResult = await getClientBookingsOverview();
  const bookings = bookingsResult.success
    ? bookingsResult.data
    : { upcoming: [], past: [] };

  const summary = summaryResult.success
    ? summaryResult.data
    : {
        dogsCount: 0,
        totalSessions: 0,
        completedSessions: 0,
        reportsCount: 0,
      };

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-8">
      {showBookingSuccess ? (
        <div
          className="break-words rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          Votre demande de réservation a été enregistrée. L&apos;éducateur la
          verra en <strong>attente de confirmation</strong> dans son agenda.
        </div>
      ) : null}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bonjour 👋</h1>
        <p className="mt-1 text-muted-foreground">
          Retrouvez vos chiens, vos séances et les éducateurs près de chez vous.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chiens</CardDescription>
            <CardTitle className="text-2xl">{summary.dogsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Séances</CardDescription>
            <CardTitle className="text-2xl">{summary.totalSessions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Terminées</CardDescription>
            <CardTitle className="text-2xl">{summary.completedSessions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Comptes-rendus</CardDescription>
            <CardTitle className="text-2xl">{summary.reportsCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <ClientBookingsPanel
        upcoming={bookings.upcoming}
        past={bookings.past}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <GraduationCap className="size-8 text-primary" aria-hidden />
            <CardTitle className="mt-3">Trouver un éducateur</CardTitle>
            <CardDescription>
              Éducateurs actifs près de votre adresse, triés par distance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/account/educateurs"
              className={buttonVariants({ className: "w-full" })}
            >
              Voir les éducateurs
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <PawPrint className="size-8 text-primary" aria-hidden />
            <CardTitle className="mt-3">Mes chiens</CardTitle>
            <CardDescription>
              Ajoutez ou modifiez une fiche et consultez l&apos;historique des
              séances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/account/chiens"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Gérer mes chiens
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarCheck className="size-5" aria-hidden />
            Bilan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Vous avez suivi{" "}
            <span className="font-medium text-foreground">
              {summary.totalSessions}
            </span>{" "}
            séance{summary.totalSessions !== 1 ? "s" : ""} au total, dont{" "}
            <span className="font-medium text-foreground">
              {summary.completedSessions}
            </span>{" "}
            terminée{summary.completedSessions !== 1 ? "s" : ""}.
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 break-words">
            <FileText className="size-4" aria-hidden />
            {summary.reportsCount} compte-rendu
            {summary.reportsCount !== 1 ? "s" : ""} disponible
            {summary.reportsCount !== 1 ? "s" : ""} sur vos fiches chiens.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
