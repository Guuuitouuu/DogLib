import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
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

  const [pendingResult, dogsResult] = await Promise.all([
    getPendingEducatorBookingsCount(),
    getEducatorDogsCount(),
  ]);
  const pendingSessionsCount = pendingResult.success ? pendingResult.data : 0;
  const dogsCount = dogsResult.success ? dogsResult.data : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar pendingSessionsCount={pendingSessionsCount} dogsCount={dogsCount} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
