"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import type { Role } from "@/generated/prisma/client";
import { Role as RoleEnum } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { geocodeAddressFr } from "@/lib/geocode-fr";
import { resolveClerkRole } from "@/lib/clerk-role";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";

const setRoleSchema = z.enum(["EDUCATOR", "CLIENT"]);

const educatorProfileSchema = z.object({
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  zipCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)."),
  bio: z.string().max(5000).optional(),
  siret: z.string().max(14).optional(),
});

type ClerkUserLike = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  emailAddresses: { emailAddress: string }[];
  phoneNumbers: { phoneNumber: string }[];
};

function clerkDisplayName(user: ClerkUserLike): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.username) return user.username;
  return user.emailAddresses[0]?.emailAddress ?? "Utilisateur";
}

async function syncClerkUserToPrisma(
  clerkUser: ClerkUserLike,
  role: Role,
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
        role,
      },
      update: {
        email,
        name: clerkDisplayName(clerkUser),
        phone: clerkUser.phoneNumbers[0]?.phoneNumber,
        role,
      },
      select: { id: true },
    });

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

export async function setUserRole(
  input: unknown,
): Promise<
  ActionResult<{ role: Role; nextPath: "/onboarding/educator" | "/onboarding/client" }>
> {
  const parsed = setRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Rôle invalide." };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const role = parsed.data;
  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) {
    return { success: false, error: "Session introuvable. Reconnectez-vous." };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    const synced = await syncClerkUserToPrisma(clerkUser, role);
    if (!synced.success) {
      return synced;
    }

    return {
      success: true,
      data: {
        role,
        nextPath: role === "EDUCATOR" ? "/onboarding/educator" : "/onboarding/client",
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible d'enregistrer votre choix. Réessayez.",
    };
  }
}

export async function completeEducatorProfile(
  input: unknown,
): Promise<ActionResult<{ educatorProfileId: string }>> {
  const parsed = educatorProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations du profil invalides." };
  }

  const siretRaw = parsed.data.siret?.trim();
  if (siretRaw && !/^\d{14}$/.test(siretRaw)) {
    return { success: false, error: "SIRET invalide (14 chiffres)." };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) {
    return { success: false, error: "Session introuvable. Reconnectez-vous." };
  }

  const role = resolveClerkRole(clerkUser.publicMetadata);
  if (role !== RoleEnum.EDUCATOR) {
    return {
      success: false,
      error: "Seuls les comptes éducateur peuvent compléter ce profil.",
    };
  }

  const synced = await syncClerkUserToPrisma(clerkUser, RoleEnum.EDUCATOR);
  if (!synced.success) {
    return synced;
  }

  const { address, city, zipCode, bio } = parsed.data;
  const siret = siretRaw && siretRaw.length > 0 ? siretRaw : undefined;

  try {
    const existing = await prisma.educatorProfile.findUnique({
      where: { userId: synced.data.userId },
      select: { id: true },
    });

    if (existing) {
      return { success: true, data: { educatorProfileId: existing.id } };
    }

    const { lat, lng } = await geocodeAddressFr({ address, city, zipCode });

    const profile = await prisma.educatorProfile.create({
      data: {
        userId: synced.data.userId,
        address,
        city,
        zipCode,
        lat,
        lng,
        bio: bio?.trim() || null,
        siret: siret ?? null,
      },
      select: { id: true },
    });

    return { success: true, data: { educatorProfileId: profile.id } };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de créer votre profil éducateur. Réessayez.",
    };
  }
}
