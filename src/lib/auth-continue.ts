import { auth, currentUser } from "@clerk/nextjs/server";

import { Role } from "@/generated/prisma/client";
import { resolveClerkRole } from "@/lib/clerk-role";
import { clientAddressIsComplete } from "@/lib/client-location";
import type { AppUserLookup } from "@/lib/db-user";
import {
  educatorProfileIsComplete,
  findAppUserByClerkId,
} from "@/lib/db-user";
import { safeRelativeRedirect } from "@/lib/safe-redirect";
import { ensureAppUserFromClerk } from "@/lib/sync-clerk-user";

const SIGN_IN_CONTINUE = "/sign-in?redirect_url=%2Fauth%2Fcontinue";

export type AuthContinueOutcome =
  | { type: "redirect"; href: string }
  | {
      type: "problem";
      title: string;
      description: string;
      hint?: string;
    };

async function resolveAppUser(clerkId: string): Promise<
  | { ok: true; user: AppUserLookup }
  | { ok: false; problem: AuthContinueOutcome & { type: "problem" } }
  | { ok: false; redirectHref: string }
> {
  let appUser = await findAppUserByClerkId(clerkId);

  if (appUser) {
    return { ok: true, user: appUser };
  }

  const clerkUser = await currentUser();
  const ensured = await ensureAppUserFromClerk(clerkId, clerkUser);

  if (!ensured.ok) {
    if (ensured.reason === "no_clerk_user") {
      return { ok: false, redirectHref: SIGN_IN_CONTINUE };
    }

    return {
      ok: false,
      problem: {
        type: "problem",
        title: "Compte connecté, base injoignable",
        description:
          ensured.message ??
          "Clerk vous a authentifié, mais DogLib ne peut pas lire ou créer votre profil en base.",
        hint: "Vérifiez DATABASE_URL dans .env.local, votre connexion Internet, et l’heure système (horloge synchronisée). Test : npm run check:db",
      },
    };
  }

  return { ok: true, user: ensured.user };
}

function destinationForUser(
  appUser: AppUserLookup,
  redirectUrl: string | undefined,
  metaRole: Role | undefined,
): string {
  if (appUser.role === Role.CLIENT) {
    if (!clientAddressIsComplete(appUser)) {
      return "/onboarding/client";
    }
    return safeRelativeRedirect(redirectUrl, "/account");
  }

  if (appUser.role === Role.EDUCATOR) {
    if (!educatorProfileIsComplete(appUser)) {
      return "/onboarding/educator";
    }
    return safeRelativeRedirect(redirectUrl, "/dashboard");
  }

  if (!metaRole) {
    return "/onboarding";
  }

  if (metaRole === Role.CLIENT) {
    return "/onboarding/client";
  }

  return "/onboarding/educator";
}

export async function resolveAuthContinueOutcome(
  redirectUrl?: string,
): Promise<AuthContinueOutcome> {
  const { userId } = await auth();
  if (!userId) {
    return { type: "redirect", href: SIGN_IN_CONTINUE };
  }

  const resolved = await resolveAppUser(userId);
  if (!resolved.ok) {
    if ("redirectHref" in resolved) {
      return { type: "redirect", href: resolved.redirectHref };
    }
    return resolved.problem;
  }

  const clerkUser = await currentUser();
  const metaRole = resolveClerkRole(clerkUser?.publicMetadata);

  return {
    type: "redirect",
    href: destinationForUser(resolved.user, redirectUrl, metaRole),
  };
}
