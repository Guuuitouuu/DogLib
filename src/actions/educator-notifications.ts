"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type {
  EducatorNotificationItem,
  EducatorNotificationsSnapshot,
} from "@/types/educator-notification";

const idSchema = z.object({ notificationId: z.string().min(1) });

function mapRow(row: {
  id: string;
  type: string;
  title: string;
  body: string;
  bookingId: string | null;
  readAt: Date | null;
  createdAt: Date;
}): EducatorNotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    bookingId: row.bookingId,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getEducatorNotifications(): Promise<
  ActionResult<EducatorNotificationsSnapshot>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const user = await prisma.user.findFirst({
      where: {
        educatorProfile: { id: educator.data.educatorProfileId },
      },
      select: { id: true },
    });
    if (!user) {
      return { success: false, error: "Profil introuvable." };
    }

    const [unreadCount, rows] = await Promise.all([
      prisma.notification.count({
        where: { userId: user.id, readAt: null },
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
    ]);

    return {
      success: true,
      data: {
        unreadCount,
        items: rows.map(mapRow),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger les notifications.",
    };
  }
}

export async function markEducatorNotificationRead(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const parsed = idSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Notification introuvable." };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        educatorProfile: { id: educator.data.educatorProfileId },
      },
      select: { id: true },
    });
    if (!user) {
      return { success: false, error: "Profil introuvable." };
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id: parsed.data.notificationId,
        userId: user.id,
      },
      data: { readAt: new Date() },
    });

    if (updated.count === 0) {
      return { success: false, error: "Notification introuvable." };
    }

    revalidatePath("/dashboard", "layout");
    return { success: true, data: { id: parsed.data.notificationId } };
  } catch (error) {
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Erreur serveur.",
    };
  }
}

export async function markAllEducatorNotificationsRead(): Promise<
  ActionResult<{ updated: number }>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  try {
    const user = await prisma.user.findFirst({
      where: {
        educatorProfile: { id: educator.data.educatorProfileId },
      },
      select: { id: true },
    });
    if (!user) {
      return { success: false, error: "Profil introuvable." };
    }

    const result = await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    revalidatePath("/dashboard", "layout");
    return { success: true, data: { updated: result.count } };
  } catch (error) {
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Erreur serveur.",
    };
  }
}
