"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorUserId } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type { EducatorPersonalDogListItem } from "@/types/educator-personal-dog";

const createDogSchema = z.object({
  name: z.string().min(1).max(80),
  breed: z.string().max(80).optional(),
  age: z.coerce.number().int().min(0).max(30).optional(),
});

function revalidateEducatorPersonalDogPaths(educatorProfileId: string) {
  revalidatePath("/dashboard/mes-chiens");
  revalidatePath("/dashboard/fiche-publique");
  revalidatePath(`/educator/${educatorProfileId}`);
}

export async function getEducatorPersonalDogsCount(): Promise<
  ActionResult<number>
> {
  const educator = await requireEducatorUserId();
  if (!educator.success) return educator;

  try {
    const count = await prisma.dog.count({
      where: { userId: educator.data.userId },
    });
    return { success: true, data: count };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de compter vos chiens.",
    };
  }
}

export async function listEducatorPersonalDogs(): Promise<
  ActionResult<EducatorPersonalDogListItem[]>
> {
  const educator = await requireEducatorUserId();
  if (!educator.success) return educator;

  try {
    const dogs = await prisma.dog.findMany({
      where: { userId: educator.data.userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        breed: true,
        age: true,
        photoUrl: true,
      },
    });

    return { success: true, data: dogs };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger vos chiens.",
    };
  }
}

export async function createEducatorPersonalDog(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string; breed: string | null }>> {
  const educator = await requireEducatorUserId();
  if (!educator.success) return educator;

  const parsed = createDogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Informations du chien invalides." };
  }

  try {
    const dog = await prisma.dog.create({
      data: {
        userId: educator.data.userId,
        name: parsed.data.name.trim(),
        breed: parsed.data.breed?.trim() || null,
        age: parsed.data.age ?? null,
      },
      select: { id: true, name: true, breed: true },
    });

    revalidateEducatorPersonalDogPaths(educator.data.educatorProfileId);

    return { success: true, data: dog };
  } catch (error) {
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Erreur serveur.",
    };
  }
}
