import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { getEducatorClientsCount } from "@/actions/educator-clients";
import { getEducatorPersonalDogsCount } from "@/actions/educator-personal-dogs";
import { getEducatorDogsCount } from "@/actions/educator-dogs";
import { getPendingEducatorBookingsCount } from "@/actions/educator-bookings";
import { Role } from "@/generated/prisma/client";
import {
  educatorProfileIsComplete,
  findAppUserByClerkId,
} from "@/lib/db-user";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const appUser = await findAppUserByClerkId(userId);

  if (!appUser) {
    redirect("/onboarding");
  }

  if (appUser.role !== Role.EDUCATOR) {
    redirect("/account");
  }

  if (!educatorProfileIsComplete(appUser)) {
    redirect("/onboarding/educator");
  }

  const [pendingResult, dogsResult, clientsResult, personalDogsResult] =
    await Promise.all([
    getPendingEducatorBookingsCount(),
    getEducatorDogsCount(),
    getEducatorClientsCount(),
    getEducatorPersonalDogsCount(),
  ]);
  const pendingReservationsCount = pendingResult.success ? pendingResult.data : 0;
  const dogsCount = dogsResult.success ? dogsResult.data : 0;
  const clientsCount = clientsResult.success ? clientsResult.data : 0;
  const personalDogsCount = personalDogsResult.success
    ? personalDogsResult.data
    : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        pendingReservationsCount={pendingReservationsCount}
        dogsCount={dogsCount}
        clientsCount={clientsCount}
        personalDogsCount={personalDogsCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
