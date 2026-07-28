import { auth } from "@clerk/nextjs/server";

import { Role } from "@/generated/prisma/client";
import { findAppUserByClerkId } from "@/lib/db-user";
import { homeSpaceForRole } from "@/lib/role-routes";

export type PublicNavContext = {
  userId: string | null;
  spaceHref: string;
  spaceLabel: string;
  role: Role | null;
  educatorProfileId: string | null;
};

export async function getPublicNavContext(): Promise<PublicNavContext> {
  const { userId } = await auth();
  if (!userId) {
    return {
      userId: null,
      spaceHref: "/sign-in",
      spaceLabel: "Connexion",
      role: null,
      educatorProfileId: null,
    };
  }

  const appUser = await findAppUserByClerkId(userId);

  if (appUser?.role === Role.EDUCATOR) {
    const space = homeSpaceForRole(Role.EDUCATOR);
    return {
      userId,
      spaceHref: space.href,
      spaceLabel: space.label,
      role: Role.EDUCATOR,
      educatorProfileId: appUser.educatorProfile?.id ?? null,
    };
  }
  if (appUser?.role === Role.CLIENT) {
    const space = homeSpaceForRole(Role.CLIENT);
    return {
      userId,
      spaceHref: space.href,
      spaceLabel: space.label,
      role: Role.CLIENT,
      educatorProfileId: null,
    };
  }

  return {
    userId,
    spaceHref: "/onboarding",
    spaceLabel: "Continuer l'inscription",
    role: null,
    educatorProfileId: null,
  };
}
