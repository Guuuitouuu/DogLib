"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { saveUploadedImageFile, validateImageFile } from "@/lib/save-uploaded-image";
import { requireClientUserId } from "@/lib/require-client";
import { requireEducatorProfile, requireEducatorUserId } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";

const dogIdSchema = z.object({
  dogId: z.string().min(1),
});

const educatorSlotSchema = z.enum(["banner", "profile", "gallery"]);

function getFileFromFormData(formData: FormData): File | null {
  const entry = formData.get("file");
  if (entry instanceof File && entry.size > 0) {
    return entry;
  }
  return null;
}

export async function uploadClientDogPhoto(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const client = await requireClientUserId();
  if (!client.success) return client;

  const parsed = dogIdSchema.safeParse({
    dogId: formData.get("dogId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Chien introuvable." };
  }

  const file = getFileFromFormData(formData);
  if (!file) {
    return { success: false, error: "Choisissez une image." };
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const dog = await prisma.dog.findFirst({
      where: { id: parsed.data.dogId, userId: client.data.userId },
      select: { id: true },
    });
    if (!dog) {
      return { success: false, error: "Chien introuvable." };
    }

    const url = await saveUploadedImageFile(file, [
      "clients",
      client.data.userId,
      "dogs",
      dog.id,
    ]);

    await prisma.dog.update({
      where: { id: dog.id },
      data: { photoUrl: url },
    });

    revalidatePath("/account");
    revalidatePath("/account/chiens");
    revalidatePath(`/account/chiens/${dog.id}`);

    return { success: true, data: { url } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Impossible d'enregistrer l'image.",
    };
  }
}

export async function uploadEducatorPersonalDogPhoto(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const educator = await requireEducatorUserId();
  if (!educator.success) return educator;

  const parsed = dogIdSchema.safeParse({
    dogId: formData.get("dogId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Chien introuvable." };
  }

  const file = getFileFromFormData(formData);
  if (!file) {
    return { success: false, error: "Choisissez une image." };
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const dog = await prisma.dog.findFirst({
      where: { id: parsed.data.dogId, userId: educator.data.userId },
      select: { id: true },
    });
    if (!dog) {
      return { success: false, error: "Chien introuvable." };
    }

    const url = await saveUploadedImageFile(file, [
      "educators",
      educator.data.educatorProfileId,
      "personal-dogs",
      dog.id,
    ]);

    await prisma.dog.update({
      where: { id: dog.id },
      data: { photoUrl: url },
    });

    revalidatePath("/dashboard/mes-chiens");
    revalidatePath("/dashboard/fiche-publique");
    revalidatePath(`/educator/${educator.data.educatorProfileId}`);

    return { success: true, data: { url } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Impossible d'enregistrer l'image.",
    };
  }
}

export async function uploadEducatorProfileImage(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const slotParsed = educatorSlotSchema.safeParse(formData.get("slot"));
  if (!slotParsed.success) {
    return { success: false, error: "Type d'image invalide." };
  }

  const file = getFileFromFormData(formData);
  if (!file) {
    return { success: false, error: "Choisissez une image." };
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const profileId = educator.data.educatorProfileId;
    const url = await saveUploadedImageFile(file, [
      "educators",
      profileId,
      slotParsed.data,
    ]);

    if (slotParsed.data === "banner") {
      await prisma.educatorProfile.update({
        where: { id: profileId },
        data: { bannerUrl: url },
      });
    } else if (slotParsed.data === "profile") {
      await prisma.educatorProfile.update({
        where: { id: profileId },
        data: { profilePhotoUrl: url },
      });
    } else {
      const current = await prisma.educatorProfile.findUnique({
        where: { id: profileId },
        select: { galleryUrls: true },
      });
      const nextGallery = [...(current?.galleryUrls ?? []), url].slice(0, 6);
      await prisma.educatorProfile.update({
        where: { id: profileId },
        data: { galleryUrls: nextGallery },
      });
    }

    revalidatePath("/dashboard/fiche-publique");
    revalidatePath("/dashboard/parametres");
    revalidatePath(`/educator/${profileId}`);

    return { success: true, data: { url } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Impossible d'enregistrer l'image.",
    };
  }
}
