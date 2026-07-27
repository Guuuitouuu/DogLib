import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EducatorProfileForm } from "@/components/onboarding/educator-profile-form";
import { Role } from "@/generated/prisma/client";
import { resolveClerkRole } from "@/lib/clerk-role";
import {
  educatorProfileIsComplete,
  findAppUserByClerkId,
} from "@/lib/db-user";

export default async function EducatorOnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const appUser = await findAppUserByClerkId(userId);

  if (appUser?.role === Role.EDUCATOR && educatorProfileIsComplete(appUser)) {
    redirect("/dashboard");
  }

  if (appUser && appUser.role !== Role.EDUCATOR) {
    redirect("/onboarding");
  }

  if (!appUser) {
    const clerkUser = await currentUser();
    const metaRole = resolveClerkRole(clerkUser?.publicMetadata);
    if (metaRole !== Role.EDUCATOR) {
      redirect("/onboarding");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <EducatorProfileForm />
    </main>
  );
}
