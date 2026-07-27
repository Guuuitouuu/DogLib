import { auth, currentUser } from "@clerk/nextjs/server";

import { Role } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { resolveClerkRole } from "@/lib/clerk-role";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";

function clerkDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  emailAddresses: { emailAddress: string }[];
}): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.username) return user.username;
  return user.emailAddresses[0]?.emailAddress ?? "Utilisateur";
}

async function upsertClientFromClerk(
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
): Promise<ActionResult<{ userId: string }>> {
  try {
    const email =
      clerkUser.emailAddresses[0]?.emailAddress ??
      `unknown+${clerkUser.id}@doglib.local`;

    const user = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      create: {
        clerkId: clerkUser.id,
        email,
        name: clerkDisplayName(clerkUser),
        phone: clerkUser.phoneNumbers[0]?.phoneNumber,
        role: Role.CLIENT,
      },
      update: {
        email,
        name: clerkDisplayName(clerkUser),
        role: Role.CLIENT,
      },
      select: { id: true, role: true },
    });

    if (user.role !== Role.CLIENT) {
      return {
        success: false,
        error: "Cette action est réservée aux comptes propriétaires.",
      };
    }

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Synchronisation du compte impossible.",
    };
  }
}

export async function requireClientUserId(): Promise<
  ActionResult<{ userId: string }>
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  });

  if (user?.role === Role.CLIENT) {
    return { success: true, data: { userId: user.id } };
  }

  if (user?.role === Role.EDUCATOR) {
    return {
      success: false,
      error: "Cette action est réservée aux comptes propriétaires.",
    };
  }

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== clerkId) {
    return {
      success: false,
      error: "Compte introuvable. Terminez l'inscription.",
    };
  }

  const role = resolveClerkRole(clerkUser.publicMetadata);
  if (role !== Role.CLIENT) {
    return {
      success: false,
      error: "Compte introuvable. Choisissez le profil propriétaire.",
    };
  }

  return upsertClientFromClerk(clerkUser);
}
