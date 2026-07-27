import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma/client";
import { ClientOnboardingWizard } from "@/components/client/client-onboarding-wizard";
import { resolveClerkRole } from "@/lib/clerk-role";
import { clientAddressIsComplete } from "@/lib/client-location";
import { findAppUserByClerkId } from "@/lib/db-user";

export const dynamic = "force-dynamic";

export default async function ClientOnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const appUser = await findAppUserByClerkId(userId);
  if (appUser?.role === Role.EDUCATOR) {
    redirect("/onboarding/educator");
  }
  if (appUser && appUser.role !== Role.CLIENT) {
    redirect("/onboarding");
  }

  if (appUser && clientAddressIsComplete(appUser)) {
    redirect("/account");
  }

  const clerkUser = await currentUser();
  const metaRole = resolveClerkRole(clerkUser?.publicMetadata);
  if (metaRole === Role.EDUCATOR) {
    redirect("/onboarding/educator");
  }
  if (metaRole && metaRole !== Role.CLIENT) {
    redirect("/onboarding");
  }

  return (
    <main className="flex w-full min-w-0 flex-1 justify-center overflow-x-hidden px-4 py-10 sm:py-16">
      <div className="w-full min-w-0 max-w-lg">
        <ClientOnboardingWizard />
      </div>
    </main>
  );
}
