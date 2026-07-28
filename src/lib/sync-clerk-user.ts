import type { User } from "@clerk/nextjs/server";

import { Role } from "@/generated/prisma/client";
import { resolveClerkRole } from "@/lib/clerk-role";
import type { AppUserLookup } from "@/lib/db-user";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";

function displayName(clerkUser: User): string {
  const full = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (full) return full;
  if (clerkUser.username) return clerkUser.username;
  return (
    clerkUser.emailAddresses[0]?.emailAddress ??
    `Utilisateur ${clerkUser.id.slice(-6)}`
  );
}

export type EnsureAppUserResult =
  | { ok: true; user: AppUserLookup }
  | { ok: false; reason: "no_clerk_user" | "db_error"; message?: string };

/** Crée ou met à jour l’utilisateur Prisma depuis Clerk (sans webhook). */
export async function ensureAppUserFromClerk(
  clerkId: string,
  clerkUser: User | null,
): Promise<EnsureAppUserResult> {
  if (!clerkUser || clerkUser.id !== clerkId) {
    return { ok: false, reason: "no_clerk_user" };
  }

  const metaRole = resolveClerkRole(clerkUser.publicMetadata);
  const role = metaRole ?? Role.CLIENT;
  const email =
    clerkUser.emailAddresses[0]?.emailAddress ??
    `unknown+${clerkUser.id}@doglib.local`;

  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email,
        name: displayName(clerkUser),
        phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
        role,
      },
      update: {
        email,
        name: displayName(clerkUser),
        phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
        ...(metaRole ? { role: metaRole } : {}),
      },
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

    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      reason: "db_error",
      message:
        prismaErrorMessage(error) ??
        "Impossible de joindre la base de données.",
    };
  }
}
