import { auth } from "@clerk/nextjs/server";

import { Role } from "@/generated/prisma/client";
import { findAppUserByClerkId } from "@/lib/db-user";

export type PublicNavContext = {
  userId: string | null;
  spaceHref: string;
  spaceLabel: string;
};

export async function getPublicNavContext(): Promise<PublicNavContext> {
  const { userId } = await auth();
  if (!userId) {
    return {
      userId: null,
      spaceHref: "/sign-in",
      spaceLabel: "Connexion",
    };
  }

  const appUser = await findAppUserByClerkId(userId);

  if (appUser?.role === Role.EDUCATOR) {
    return {
      userId,
      spaceHref: "/dashboard",
      spaceLabel: "Tableau de bord",
    };
  }
  if (appUser?.role === Role.CLIENT) {
    return {
      userId,
      spaceHref: "/account",
      spaceLabel: "Mon compte",
    };
  }

  return {
    userId,
    spaceHref: "/onboarding",
    spaceLabel: "Continuer l'inscription",
  };
}
