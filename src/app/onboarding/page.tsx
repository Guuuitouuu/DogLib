import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma/client";
import { OnboardingRolePicker } from "@/components/onboarding/onboarding-role-picker";
import { resolveClerkRole } from "@/lib/clerk-role";
import { clientAddressIsComplete } from "@/lib/client-location";
import {
  educatorProfileIsComplete,
  findAppUserByClerkId,
} from "@/lib/db-user";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const appUser = await findAppUserByClerkId(userId);

  if (appUser?.role === Role.CLIENT) {
    if (clientAddressIsComplete(appUser)) {
      redirect("/account");
    }
    redirect("/onboarding/client");
  }

  if (appUser?.role === Role.EDUCATOR) {
    if (educatorProfileIsComplete(appUser)) {
      redirect("/dashboard");
    }
    redirect("/onboarding/educator");
  }

  const clerkUser = await currentUser();
  const metaRole = resolveClerkRole(clerkUser?.publicMetadata);
  if (metaRole === Role.CLIENT) {
    redirect("/onboarding/client");
  }
  if (metaRole === Role.EDUCATOR) {
    redirect("/onboarding/educator");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <OnboardingRolePicker />
    </main>
  );
}
