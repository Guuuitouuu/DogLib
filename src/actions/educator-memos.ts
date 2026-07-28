"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type { EducatorMemoItem } from "@/types/educator-memo";

const memoContentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Le mémo ne peut pas être vide.")
    .max(10_000, "Le mémo est trop long (10 000 caractères max)."),
});

const createMemoSchema = memoContentSchema;

const updateMemoSchema = memoContentSchema.extend({
  memoId: z.string().min(1),
});

const memoIdSchema = z.object({
  memoId: z.string().min(1),
});

const archiveMemoSchema = memoIdSchema.extend({
  archived: z.boolean(),
});

function mapMemo(row: {
  id: string;
  content: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): EducatorMemoItem {
  return {
    id: row.id,
    content: row.content,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
}

export async function listEducatorMemos(): Promise<
  ActionResult<EducatorMemoItem[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const rows = await prisma.memo.findMany({
      where: { educatorProfileId: educator.data.educatorProfileId },
      orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
    });
    return { success: true, data: rows.map(mapMemo) };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger vos mémos.",
    };
  }
}

export async function createEducatorMemo(
  input: unknown,
): Promise<ActionResult<EducatorMemoItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = createMemoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Entrée invalide.",
    };
  }

  try {
    const row = await prisma.memo.create({
      data: {
        educatorProfileId: educator.data.educatorProfileId,
        content: parsed.data.content,
      },
    });
    revalidateDashboard();
    return { success: true, data: mapMemo(row) };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible d'enregistrer le mémo.",
    };
  }
}

export async function updateEducatorMemo(
  input: unknown,
): Promise<ActionResult<EducatorMemoItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = updateMemoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Entrée invalide.",
    };
  }

  try {
    const existing = await prisma.memo.findFirst({
      where: {
        id: parsed.data.memoId,
        educatorProfileId: educator.data.educatorProfileId,
      },
    });
    if (!existing) {
      return { success: false, error: "Mémo introuvable." };
    }

    const row = await prisma.memo.update({
      where: { id: parsed.data.memoId },
      data: { content: parsed.data.content },
    });
    revalidateDashboard();
    return { success: true, data: mapMemo(row) };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de mettre à jour le mémo.",
    };
  }
}

export async function deleteEducatorMemo(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = memoIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Entrée invalide." };
  }

  try {
    const existing = await prisma.memo.findFirst({
      where: {
        id: parsed.data.memoId,
        educatorProfileId: educator.data.educatorProfileId,
      },
    });
    if (!existing) {
      return { success: false, error: "Mémo introuvable." };
    }

    await prisma.memo.delete({ where: { id: parsed.data.memoId } });
    revalidateDashboard();
    return { success: true, data: { id: parsed.data.memoId } };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de supprimer le mémo.",
    };
  }
}

export async function setEducatorMemoArchived(
  input: unknown,
): Promise<ActionResult<EducatorMemoItem>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = archiveMemoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Entrée invalide." };
  }

  try {
    const existing = await prisma.memo.findFirst({
      where: {
        id: parsed.data.memoId,
        educatorProfileId: educator.data.educatorProfileId,
      },
    });
    if (!existing) {
      return { success: false, error: "Mémo introuvable." };
    }

    const row = await prisma.memo.update({
      where: { id: parsed.data.memoId },
      data: {
        archivedAt: parsed.data.archived ? new Date() : null,
      },
    });
    revalidateDashboard();
    return { success: true, data: mapMemo(row) };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de mettre à jour le mémo.",
    };
  }
}
