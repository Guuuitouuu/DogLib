import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma/client";
import { resolveClerkRole } from "@/lib/clerk-role";
import { clientAddressIsComplete } from "@/lib/client-location";
import {
  educatorProfileIsComplete,
  findAppUserByClerkId,
} from "@/lib/db-user";
import { clientAddressIsComplete } from "@/lib/client-location";
import { resolvePostAuthRedirect } from "@/lib/role-routes";

type AuthContinuePageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function AuthContinuePage({
  searchParams,
}: AuthContinuePageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { redirect_url: redirectUrl } = await searchParams;
  const appUser = await findAppUserByClerkId(userId);

  if (appUser?.role === Role.CLIENT) {
    if (!clientAddressIsComplete(appUser)) {
      redirect("/onboarding/client");
    }
    redirect(resolvePostAuthRedirect(Role.CLIENT, redirectUrl));
  }

  if (appUser?.role === Role.EDUCATOR) {
    if (!educatorProfileIsComplete(appUser)) {
      redirect("/onboarding/educator");
    }
    redirect(resolvePostAuthRedirect(Role.EDUCATOR, redirectUrl));
  }

  const clerkUser = await currentUser();
  const metaRole = resolveClerkRole(clerkUser?.publicMetadata);

  if (!metaRole) {
    redirect("/onboarding");
  }

  if (metaRole === Role.CLIENT) {
    redirect("/onboarding/client");
  }

  redirect("/onboarding/educator");
}
