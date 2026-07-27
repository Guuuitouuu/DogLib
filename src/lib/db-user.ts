import type { Role } from "@/generated/prisma/client";
import { resolveClerkRole } from "@/lib/clerk-role";
import { prisma } from "@/lib/prisma";

export type AppUserLookup = {
  id: string;
  role: Role;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  lat: number | null;
  lng: number | null;
  educatorProfile: { id: string } | null;
};

export type UserEducatorProfileLookup = {
  educatorProfile: { id: string } | null;
} | null;

/** Returns null when the database is unreachable or the query fails. */
export async function findAppUserByClerkId(
  clerkId: string,
): Promise<AppUserLookup | null> {
  try {
    return await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        role: true,
        address: true,
        city: true,
        zipCode: true,
        lat: true,
        lng: true,
        educatorProfile: { select: { id: true } },
      },
    });
  } catch (error) {
    console.error("[DogLib] Prisma user lookup failed:", error);
    return null;
  }
}

/** @deprecated Prefer findAppUserByClerkId */
export async function findUserEducatorProfileByClerkId(
  clerkId: string,
): Promise<UserEducatorProfileLookup> {
  try {
    return await prisma.user.findUnique({
      where: { clerkId },
      select: { educatorProfile: { select: { id: true } } },
    });
  } catch (error) {
    console.error("[DogLib] Prisma user lookup failed:", error);
    return null;
  }
}

export function educatorProfileIsComplete(
  user: UserEducatorProfileLookup | AppUserLookup,
): boolean {
  return Boolean(user?.educatorProfile?.id);
}

export async function resolveRoleForClerkId(
  clerkId: string,
  clerkMetadata?: unknown,
): Promise<Role | undefined> {
  const appUser = await findAppUserByClerkId(clerkId);
  if (appUser) return appUser.role;
  return resolveClerkRole(clerkMetadata);
}
