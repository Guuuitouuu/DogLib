"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { geocodeAddressFr } from "@/lib/geocode-fr";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireClientUserId } from "@/lib/require-client";
import { prisma } from "@/lib/prisma";
import type { ClientLocation, ClientProfile } from "@/types/client-dashboard";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { joinPersonName, splitPersonName } from "@/lib/person-name";

const phoneField = z
  .string()
  .max(30)
  .optional()
  .transform((v) => v?.trim() || undefined);

const addressSchema = z.object({
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  zipCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)."),
  phone: phoneField,
});

const profileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis.").max(80),
  lastName: z.string().max(80).optional(),
  phone: phoneField,
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  zipCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)."),
});

export async function getClientLocation(): Promise<
  ActionResult<ClientLocation | null>
> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  try {
    const user = await prisma.user.findUnique({
      where: { id: client.data.userId },
      select: {
        address: true,
        city: true,
        zipCode: true,
        lat: true,
        lng: true,
        phone: true,
      },
    });
    if (
      !user?.address ||
      user.lat == null ||
      user.lng == null ||
      !user.city ||
      !user.zipCode
    ) {
      return { success: true, data: null };
    }
    return {
      success: true,
      data: {
        address: user.address,
        city: user.city,
        zipCode: user.zipCode,
        lat: user.lat,
        lng: user.lng,
        phone: user.phone,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger votre adresse.",
    };
  }
}

export async function updateClientAddress(
  input: unknown,
): Promise<ActionResult<ClientLocation>> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Adresse invalide." };
  }

  const { address, city, zipCode, phone } = parsed.data;
  const trimmedAddress = address.trim();
  const trimmedCity = city.trim();
  const trimmedZip = zipCode.trim();

  try {
    const { lat, lng } = await geocodeAddressFr({
      address: trimmedAddress,
      city: trimmedCity,
      zipCode: trimmedZip,
    });

    await prisma.user.update({
      where: { id: client.data.userId },
      data: {
        address: trimmedAddress,
        city: trimmedCity,
        zipCode: trimmedZip,
        lat,
        lng,
        phone: phone ?? null,
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/educateurs");
    revalidatePath("/account/profil");
    revalidatePath("/onboarding/client");

    return {
      success: true,
      data: {
        address: trimmedAddress,
        city: trimmedCity,
        zipCode: trimmedZip,
        lat,
        lng,
        phone: phone ?? null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible d'enregistrer votre adresse.",
    };
  }
}

/** Alias onboarding — même enregistrement que updateClientAddress. */
export async function completeClientAddress(
  input: unknown,
): Promise<ActionResult<ClientLocation>> {
  return updateClientAddress(input);
}

export async function getClientProfile(): Promise<
  ActionResult<ClientProfile>
> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  try {
    const [dbUser, clerkUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: client.data.userId },
        select: {
          email: true,
          name: true,
          phone: true,
          address: true,
          city: true,
          zipCode: true,
        },
      }),
      currentUser(),
    ]);

    if (!dbUser) {
      return { success: false, error: "Profil introuvable." };
    }

    const fromDb = splitPersonName(dbUser.name);
    const firstName = clerkUser?.firstName?.trim() || fromDb.firstName;
    const lastName = clerkUser?.lastName?.trim() || fromDb.lastName;
    const imageUrl =
      clerkUser?.hasImage && clerkUser.imageUrl ? clerkUser.imageUrl : null;

    return {
      success: true,
      data: {
        email: dbUser.email,
        firstName,
        lastName,
        phone: dbUser.phone,
        address: dbUser.address ?? "",
        city: dbUser.city ?? "",
        zipCode: dbUser.zipCode ?? "",
        imageUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger votre profil.",
    };
  }
}

export async function updateClientProfile(
  input: unknown,
): Promise<ActionResult<ClientProfile>> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations invalides." };
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const firstName = parsed.data.firstName.trim();
  const lastName = (parsed.data.lastName ?? "").trim();
  const trimmedAddress = parsed.data.address.trim();
  const trimmedCity = parsed.data.city.trim();
  const trimmedZip = parsed.data.zipCode.trim();
  const phone = parsed.data.phone ?? null;
  const fullName = joinPersonName(firstName, lastName);

  try {
    const { lat, lng } = await geocodeAddressFr({
      address: trimmedAddress,
      city: trimmedCity,
      zipCode: trimmedZip,
    });

    const clerk = await clerkClient();
    await clerk.users.updateUser(clerkId, {
      firstName,
      lastName: lastName || undefined,
    });

    await prisma.user.update({
      where: { id: client.data.userId },
      data: {
        name: fullName,
        phone,
        address: trimmedAddress,
        city: trimmedCity,
        zipCode: trimmedZip,
        lat,
        lng,
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/profil");
    revalidatePath("/account/educateurs");
    revalidatePath("/onboarding/client");

    const clerkUser = await currentUser();
    const imageUrl =
      clerkUser?.hasImage && clerkUser.imageUrl ? clerkUser.imageUrl : null;

    return {
      success: true,
      data: {
        email: (
          await prisma.user.findUnique({
            where: { id: client.data.userId },
            select: { email: true },
          })
        )!.email,
        firstName,
        lastName,
        phone,
        address: trimmedAddress,
        city: trimmedCity,
        zipCode: trimmedZip,
        imageUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible d'enregistrer votre profil.",
    };
  }
}
