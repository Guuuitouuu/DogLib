"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";

export type EducatorServiceItem = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
};

const serviceBodySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(5000).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  priceCents: z.coerce.number().int().min(0).max(1_000_000),
  isActive: z.boolean().optional(),
});

const serviceIdSchema = z.object({
  serviceId: z.string().min(1),
});

const updateServiceSchema = z.object({
  serviceId: z.string().min(1),
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(5000).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
  priceCents: z.coerce.number().int().min(0).max(1_000_000).optional(),
  isActive: z.boolean().optional(),
});

function mapService(row: {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}): EducatorServiceItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    durationMinutes: row.durationMinutes,
    priceCents: row.price,
    isActive: row.isActive,
  };
}

export async function listEducatorServices(): Promise<
  ActionResult<EducatorServiceItem[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const rows = await prisma.service.findMany({
      where: { educatorProfileId: educator.data.educatorProfileId },
      orderBy: [{ isActive: "desc" }, { title: "asc" }],
    });
    return { success: true, data: rows.map(mapService) };
  } catch {
    return { success: false, error: "Impossible de charger les services." };
  }
}

export async function createEducatorService(
  input: unknown,
): Promise<ActionResult<EducatorServiceItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = serviceBodySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations du service invalides." };
  }

  try {
    const row = await prisma.service.create({
      data: {
        educatorProfileId: educator.data.educatorProfileId,
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        durationMinutes: parsed.data.durationMinutes,
        price: parsed.data.priceCents,
        isActive: parsed.data.isActive ?? true,
      },
    });
    return { success: true, data: mapService(row) };
  } catch {
    return { success: false, error: "Impossible de créer le service." };
  }
}

export async function updateEducatorService(
  input: unknown,
): Promise<ActionResult<EducatorServiceItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = updateServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Mise à jour invalide." };
  }

  const { serviceId, ...fields } = parsed.data;
  if (Object.keys(fields).length === 0) {
    return { success: false, error: "Aucune modification fournie." };
  }

  try {
    const existing = await prisma.service.findFirst({
      where: {
        id: serviceId,
        educatorProfileId: educator.data.educatorProfileId,
      },
    });
    if (!existing) {
      return { success: false, error: "Service introuvable." };
    }

    const row = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(fields.title !== undefined ? { title: fields.title.trim() } : {}),
        ...(fields.description !== undefined
          ? { description: fields.description?.trim() || null }
          : {}),
        ...(fields.durationMinutes !== undefined
          ? { durationMinutes: fields.durationMinutes }
          : {}),
        ...(fields.priceCents !== undefined ? { price: fields.priceCents } : {}),
        ...(fields.isActive !== undefined ? { isActive: fields.isActive } : {}),
      },
    });
    return { success: true, data: mapService(row) };
  } catch {
    return { success: false, error: "Impossible de mettre à jour le service." };
  }
}

export async function deleteEducatorService(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = serviceIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identifiant invalide." };
  }

  try {
    const existing = await prisma.service.findFirst({
      where: {
        id: parsed.data.serviceId,
        educatorProfileId: educator.data.educatorProfileId,
      },
      select: { id: true, _count: { select: { bookings: true } } },
    });
    if (!existing) {
      return { success: false, error: "Service introuvable." };
    }
    if (existing._count.bookings > 0) {
      return {
        success: false,
        error:
          "Ce service a des réservations. Désactivez-le plutôt que de le supprimer.",
      };
    }

    await prisma.service.delete({ where: { id: existing.id } });
    return { success: true, data: { id: existing.id } };
  } catch {
    return { success: false, error: "Impossible de supprimer le service." };
  }
}
