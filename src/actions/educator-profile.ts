"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { geocodeAddressFr } from "@/lib/geocode-fr";
import { mediaUrlSchema, parseOptionalMediaUrl } from "@/lib/media-url";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";

export type EducatorProfileSettings = {
  educatorProfileId: string;
  address: string;
  city: string;
  zipCode: string;
  bio: string | null;
  siret: string | null;
  bannerUrl: string | null;
  profilePhotoUrl: string | null;
  galleryUrls: string[];
  showLocationMap: boolean;
  lat: number;
  lng: number;
};

const updateAppearanceSchema = z.object({
  bannerUrl: z.string().max(2048).optional(),
  profilePhotoUrl: z.string().max(2048).optional(),
  galleryUrls: z.array(z.string().max(2048)).max(6).optional(),
  showLocationMap: z.boolean().optional(),
});

function normalizeGalleryUrls(urls: string[] | undefined): string[] {
  if (!urls) return [];
  const out: string[] = [];
  for (const raw of urls) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const parsed = mediaUrlSchema.safeParse(trimmed);
    if (parsed.success) out.push(trimmed);
  }
  return out.slice(0, 6);
}
const updatePublicProfileSchema = z.object({
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  zipCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)."),
  bio: z.string().max(5000).optional(),
  siret: z.string().max(14).optional(),
});

export async function getEducatorProfileSettings(): Promise<
  ActionResult<EducatorProfileSettings>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const profile = await prisma.educatorProfile.findUnique({
      where: { id: educator.data.educatorProfileId },
      select: {
        id: true,
        address: true,
        city: true,
        zipCode: true,
        bio: true,
        siret: true,
        bannerUrl: true,
        profilePhotoUrl: true,
        galleryUrls: true,
        showLocationMap: true,
        lat: true,
        lng: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil éducateur introuvable." };
    }

    return {
      success: true,
      data: {
        educatorProfileId: profile.id,
        address: profile.address,
        city: profile.city,
        zipCode: profile.zipCode,
        bio: profile.bio,
        siret: profile.siret,
        bannerUrl: profile.bannerUrl,
        profilePhotoUrl: profile.profilePhotoUrl,
        galleryUrls: profile.galleryUrls,
        showLocationMap: profile.showLocationMap,
        lat: profile.lat,
        lng: profile.lng,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger le profil.",
    };
  }
}

export async function updateEducatorPublicProfile(
  input: unknown,
): Promise<ActionResult<{ educatorProfileId: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = updatePublicProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations du profil invalides." };
  }

  const siretRaw = parsed.data.siret?.trim();
  if (siretRaw && !/^\d{14}$/.test(siretRaw)) {
    return { success: false, error: "SIRET invalide (14 chiffres)." };
  }

  const { address, city, zipCode, bio } = parsed.data;
  const siret = siretRaw && siretRaw.length > 0 ? siretRaw : null;

  try {
    const existing = await prisma.educatorProfile.findUnique({
      where: { id: educator.data.educatorProfileId },
      select: { id: true, address: true, city: true, zipCode: true },
    });

    if (!existing) {
      return { success: false, error: "Profil éducateur introuvable." };
    }

    const addressChanged =
      existing.address !== address.trim() ||
      existing.city !== city.trim() ||
      existing.zipCode !== zipCode.trim();

    const { lat, lng } = addressChanged
      ? await geocodeAddressFr({ address, city, zipCode })
      : await prisma.educatorProfile
          .findUnique({
            where: { id: existing.id },
            select: { lat: true, lng: true },
          })
          .then((p) => ({ lat: p!.lat, lng: p!.lng }));

    await prisma.educatorProfile.update({
      where: { id: existing.id },
      data: {
        address: address.trim(),
        city: city.trim(),
        zipCode: zipCode.trim(),
        bio: bio?.trim() || null,
        siret,
        ...(addressChanged ? { lat, lng } : {}),
      },
    });

    revalidatePath("/dashboard/parametres");
    revalidatePath("/dashboard/fiche-publique");
    revalidatePath(`/educator/${existing.id}`);

    return { success: true, data: { educatorProfileId: existing.id } };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de mettre à jour le profil.",
    };
  }
}

export async function updateEducatorProfileAppearance(
  input: unknown,
): Promise<ActionResult<{ educatorProfileId: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = updateAppearanceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Personnalisation invalide." };
  }

  const bannerUrl = parseOptionalMediaUrl(parsed.data.bannerUrl);
  const profilePhotoUrl = parseOptionalMediaUrl(parsed.data.profilePhotoUrl);
  const galleryUrls = normalizeGalleryUrls(parsed.data.galleryUrls);

  if (parsed.data.bannerUrl?.trim() && bannerUrl === null) {
    return { success: false, error: "URL de bannière invalide." };
  }
  if (parsed.data.profilePhotoUrl?.trim() && profilePhotoUrl === null) {
    return { success: false, error: "URL de photo de profil invalide." };
  }

  try {
    const existing = await prisma.educatorProfile.findUnique({
      where: { id: educator.data.educatorProfileId },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: "Profil éducateur introuvable." };
    }

    await prisma.educatorProfile.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.bannerUrl !== undefined ? { bannerUrl } : {}),
        ...(parsed.data.profilePhotoUrl !== undefined
          ? { profilePhotoUrl }
          : {}),
        ...(parsed.data.galleryUrls !== undefined ? { galleryUrls } : {}),
        ...(parsed.data.showLocationMap !== undefined
          ? { showLocationMap: parsed.data.showLocationMap }
          : {}),
      },
    });

    revalidatePath("/dashboard/parametres");
    revalidatePath("/dashboard/fiche-publique");
    revalidatePath(`/educator/${existing.id}`);

    return { success: true, data: { educatorProfileId: existing.id } };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de mettre à jour la personnalisation.",
    };
  }
}
