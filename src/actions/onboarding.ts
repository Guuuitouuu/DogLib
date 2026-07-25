"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import type { Role } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";

const setRoleSchema = z.enum(["EDUCATOR", "CLIENT"]);

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

export async function setUserRole(
  input: unknown,
): Promise<ActionResult<{ role: Role }>> {
  const parsed = setRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Rôle invalide." };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const role = parsed.data;

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    const clerkUser = await client.users.getUser(userId);
    const email =
      clerkUser.emailAddresses[0]?.emailAddress ??
      `unknown+${userId}@doglib.local`;

    await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email,
        name: clerkDisplayName(clerkUser),
        phone: clerkUser.phoneNumbers[0]?.phoneNumber,
        role,
      },
      update: { role },
    });

    return { success: true, data: { role } };
  } catch {
    return {
      success: false,
      error: "Impossible d'enregistrer votre choix. Réessayez.",
    };
  }
}
