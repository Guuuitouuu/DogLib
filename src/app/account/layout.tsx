import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getClientBookingsOverview } from "@/actions/client-bookings";
import { getClientDashboardSummary, listClientDogs } from "@/actions/client-dogs";
import { ClientAccountTopbar } from "@/components/client/client-account-topbar";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { Role } from "@/generated/prisma/client";
import { clientAddressIsComplete } from "@/lib/client-location";
import { findAppUserByClerkId } from "@/lib/db-user";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/account");
  }

  const appUser = await findAppUserByClerkId(userId);
  if (!appUser) {
    redirect("/onboarding");
  }
  if (appUser.role === Role.EDUCATOR) {
    redirect("/dashboard");
  }
  if (!clientAddressIsComplete(appUser)) {
    redirect("/onboarding/client");
  }

  const [summaryResult, bookingsResult, dogsResult] = await Promise.all([
    getClientDashboardSummary(),
    getClientBookingsOverview(),
    listClientDogs(),
  ]);

  const summary = summaryResult.success
    ? summaryResult.data
    : {
        dogsCount: 0,
        totalReservations: 0,
        completedReservations: 0,
        reportsCount: 0,
      };
  const upcomingCount = bookingsResult.success
    ? bookingsResult.data.upcoming.length
    : 0;
  const featuredDogName = dogsResult.success
    ? (dogsResult.data[0]?.name ?? null)
    : null;

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-background">
      <ClientSidebar
        dogsCount={summary.dogsCount}
        upcomingCount={upcomingCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ClientAccountTopbar featuredDogName={featuredDogName} />
        <main className="flex-1 space-y-6 px-5 py-6 md:px-8">
          <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
