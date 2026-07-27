import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AuthContinueProblem } from "@/components/auth/auth-continue-problem";
import { Role } from "@/generated/prisma/client";
import { resolveClerkRole } from "@/lib/clerk-role";
import { clientAddressIsComplete } from "@/lib/client-location";
import {
  educatorProfileIsComplete,
  findAppUserByClerkId,
} from "@/lib/db-user";
import { safeRelativeRedirect } from "@/lib/safe-redirect";
import { ensureAppUserFromClerk } from "@/lib/sync-clerk-user";

type AuthContinuePageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function AuthContinuePage({
  searchParams,
}: AuthContinuePageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=%2Fauth%2Fcontinue");
  }

  const { redirect_url: redirectUrl } = await searchParams;
  let appUser = await findAppUserByClerkId(userId);

  if (!appUser) {
    const clerkUser = await currentUser();
    const ensured = await ensureAppUserFromClerk(userId, clerkUser);

    if (!ensured.ok) {
      if (ensured.reason === "no_clerk_user") {
        redirect("/sign-in?redirect_url=%2Fauth%2Fcontinue");
      }

      return (
        <AuthContinueProblem
          title="Compte connecté, base injoignable"
          description={
            ensured.message ??
            "Clerk vous a authentifié, mais DogLib ne peut pas lire ou créer votre profil en base."
          }
          hint="Vérifiez DATABASE_URL dans .env.local, votre connexion Internet, et l’heure système (horloge synchronisée). Test : npm run check:db"
        />
      );
    }

    appUser = ensured.user;
  }

  if (appUser.role === Role.CLIENT) {
    if (!clientAddressIsComplete(appUser)) {
      redirect("/onboarding/client");
    }
    redirect(safeRelativeRedirect(redirectUrl, "/account"));
  }

  if (appUser.role === Role.EDUCATOR) {
    if (!educatorProfileIsComplete(appUser)) {
      redirect("/onboarding/educator");
    }
    redirect(safeRelativeRedirect(redirectUrl, "/dashboard"));
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
