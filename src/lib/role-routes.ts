import { Role } from "@/generated/prisma/client";

import { safeRelativeRedirect } from "./safe-redirect";

export type RoleSpace = {
  href: string;
  label: string;
};

export function homeSpaceForRole(role: Role): RoleSpace {
  if (role === Role.EDUCATOR) {
    return { href: "/dashboard", label: "Tableau de bord" };
  }
  return { href: "/account", label: "Mon compte" };
}

export function isClientSpacePath(path: string): boolean {
  return (
    path === "/account" ||
    path.startsWith("/account/") ||
    path === "/onboarding/client" ||
    path.startsWith("/onboarding/client/")
  );
}

export function isEducatorSpacePath(path: string): boolean {
  return (
    path === "/dashboard" ||
    path.startsWith("/dashboard/") ||
    path === "/onboarding/educator" ||
    path.startsWith("/onboarding/educator/")
  );
}

/** Redirection après connexion : pas de mélange espace client / éducateur. */
export function resolvePostAuthRedirect(
  role: Role,
  redirectUrl?: string,
): string {
  const fallback =
    role === Role.EDUCATOR ? "/dashboard" : "/account";
  const target = safeRelativeRedirect(redirectUrl, fallback);

  if (role === Role.EDUCATOR && isClientSpacePath(target)) {
    return fallback;
  }
  if (role === Role.CLIENT && isEducatorSpacePath(target)) {
    return fallback;
  }
  return target;
}

export function resolveEducatorPublicBackLink(input: {
  viewedEducatorProfileId: string;
  viewerRole: Role | null;
  viewerEducatorProfileId: string | null;
}): RoleSpace {
  if (
    input.viewerRole === Role.EDUCATOR &&
    input.viewerEducatorProfileId === input.viewedEducatorProfileId
  ) {
    return {
      href: "/dashboard/fiche-publique",
      label: "← Ma fiche publique",
    };
  }
  return {
    href: "/recherche",
    label: "← Tous les éducateurs",
  };
}
