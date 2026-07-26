"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import { isHmRangeValid, isValidHm } from "@/lib/time-hm";

export type EducatorAvailabilityItem = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const availabilityBodySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().optional(),
});

const availabilityIdSchema = z.object({
  availabilityId: z.string().min(1),
});

const updateAvailabilitySchema = z.object({
  availabilityId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

function validateTimes(startTime: string, endTime: string): string | null {
  if (!isValidHm(startTime) || !isValidHm(endTime)) {
    return "Horaires invalides (format HH:mm).";
  }
  if (!isHmRangeValid(startTime, endTime)) {
    return "L'heure de fin doit être après l'heure de début.";
  }
  return null;
}

function mapRow(row: {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}): EducatorAvailabilityItem {
  return {
    id: row.id,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    isActive: row.isActive,
  };
}

export async function listEducatorAvailabilities(): Promise<
  ActionResult<EducatorAvailabilityItem[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const rows = await prisma.availability.findMany({
      where: { educatorProfileId: educator.data.educatorProfileId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return { success: true, data: rows.map(mapRow) };
  } catch {
    return { success: false, error: "Impossible de charger les disponibilités." };
  }
}

export async function createEducatorAvailability(
  input: unknown,
): Promise<ActionResult<EducatorAvailabilityItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = availabilityBodySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Plage horaire invalide." };
  }

  const timeError = validateTimes(parsed.data.startTime, parsed.data.endTime);
  if (timeError) return { success: false, error: timeError };

  try {
    const row = await prisma.availability.create({
      data: {
        educatorProfileId: educator.data.educatorProfileId,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        isActive: parsed.data.isActive ?? true,
      },
    });
    return { success: true, data: mapRow(row) };
  } catch {
    return { success: false, error: "Impossible de créer la disponibilité." };
  }
}

export async function updateEducatorAvailability(
  input: unknown,
): Promise<ActionResult<EducatorAvailabilityItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = updateAvailabilitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Mise à jour invalide." };
  }

  const { availabilityId, ...fields } = parsed.data;
  if (Object.keys(fields).length === 0) {
    return { success: false, error: "Aucune modification fournie." };
  }

  try {
    const existing = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        educatorProfileId: educator.data.educatorProfileId,
      },
    });
    if (!existing) {
      return { success: false, error: "Disponibilité introuvable." };
    }

    const startTime = fields.startTime ?? existing.startTime;
    const endTime = fields.endTime ?? existing.endTime;
    const timeError = validateTimes(startTime, endTime);
    if (timeError) return { success: false, error: timeError };

    const row = await prisma.availability.update({
      where: { id: availabilityId },
      data: {
        ...(fields.dayOfWeek !== undefined ? { dayOfWeek: fields.dayOfWeek } : {}),
        ...(fields.startTime !== undefined ? { startTime: fields.startTime } : {}),
        ...(fields.endTime !== undefined ? { endTime: fields.endTime } : {}),
        ...(fields.isActive !== undefined ? { isActive: fields.isActive } : {}),
      },
    });
    return { success: true, data: mapRow(row) };
  } catch {
    return {
      success: false,
      error: "Impossible de mettre à jour la disponibilité.",
    };
  }
}

export async function deleteEducatorAvailability(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = availabilityIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identifiant invalide." };
  }

  try {
    const existing = await prisma.availability.findFirst({
      where: {
        id: parsed.data.availabilityId,
        educatorProfileId: educator.data.educatorProfileId,
      },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: "Disponibilité introuvable." };
    }

    await prisma.availability.delete({ where: { id: existing.id } });
    return { success: true, data: { id: existing.id } };
  } catch {
    return { success: false, error: "Impossible de supprimer la disponibilité." };
  }
}
