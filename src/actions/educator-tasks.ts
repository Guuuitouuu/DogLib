"use server";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  formatParisRelativeSessionLabel,
  getParisMonthBoundsUtc,
} from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type { EducatorTaskItem } from "@/types/educator-task";

export async function getEducatorDashboardTasks(): Promise<
  ActionResult<EducatorTaskItem[]>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const now = new Date();
  const { startUtc } = getParisMonthBoundsUtc();

  try {
    const [pending, needingReport] = await Promise.all([
      prisma.booking.findMany({
        where: {
          educatorProfileId: educator.data.educatorProfileId,
          status: BookingStatus.PENDING,
        },
        include: {
          dog: { select: { name: true } },
          client: { select: { name: true } },
          service: { select: { title: true } },
        },
        orderBy: { dateTime: "asc" },
        take: 5,
      }),
      prisma.booking.findMany({
        where: {
          educatorProfileId: educator.data.educatorProfileId,
          status: BookingStatus.COMPLETED,
          postSessionReport: null,
          dateTime: { gte: startUtc, lte: now },
        },
        include: {
          dog: { select: { name: true } },
          client: { select: { name: true } },
        },
        orderBy: { dateTime: "desc" },
        take: 5,
      }),
    ]);

    const tasks: EducatorTaskItem[] = [];

    for (const booking of pending) {
      tasks.push({
        id: `pending:${booking.id}`,
        label: `Confirmer ${booking.dog.name}`,
        detail: `${booking.client.name} · ${booking.service.title} · ${formatParisRelativeSessionLabel(booking.dateTime, now)}`,
        tag: "relance",
        href: `/dashboard/seances/${booking.id}`,
      });
    }

    for (const booking of needingReport) {
      tasks.push({
        id: `report:${booking.id}`,
        label: `Compte-rendu · ${booking.dog.name}`,
        detail: `${booking.client.name} · ${formatParisRelativeSessionLabel(booking.dateTime, now)}`,
        tag: "compte-rendu",
        href: `/dashboard/seances/${booking.id}`,
      });
    }

    return { success: true, data: tasks.slice(0, 8) };
  } catch (error) {
    console.error("[getEducatorDashboardTasks]", error);
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Impossible de charger les tâches.",
    };
  }
}
