"use server";

import { BookingStatus } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import {
  formatParisDateShort,
  formatTimeParis,
  getParisLastMonthsBoundsUtc,
  getParisMonthBoundsUtc,
} from "@/lib/paris-time";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { requireEducatorProfile } from "@/lib/require-educator";
import { prisma } from "@/lib/prisma";
import type {
  EducatorBillingOverview,
  EducatorInvoiceItem,
  EducatorInvoiceStatus,
  EducatorRevenueMonth,
} from "@/types/educator-billing";

function invoiceStatusForBooking(
  status: BookingStatus,
  dateTime: Date,
  now: Date,
): EducatorInvoiceStatus | null {
  if (status === BookingStatus.CANCELLED) return null;
  if (status === BookingStatus.COMPLETED) return "payee";
  if (dateTime.getTime() < now.getTime()) return "en_retard";
  return "en_attente";
}

export async function getEducatorBillingOverview(): Promise<
  ActionResult<EducatorBillingOverview>
> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const { startUtc, endUtc } = getParisMonthBoundsUtc();
  const now = new Date();

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        dateTime: { gte: startUtc, lte: endUtc },
        status: { not: BookingStatus.CANCELLED },
      },
      include: {
        dog: { select: { name: true } },
        service: { select: { title: true, price: true } },
        client: { select: { name: true } },
      },
      orderBy: { dateTime: "desc" },
    });

    const invoices: EducatorInvoiceItem[] = [];
    let paidCents = 0;
    let pendingCents = 0;
    let lateCents = 0;

    for (const booking of bookings) {
      const status = invoiceStatusForBooking(booking.status, booking.dateTime, now);
      if (!status) continue;

      const amountCents = booking.service.price;
      if (status === "payee") paidCents += amountCents;
      else if (status === "en_attente") pendingCents += amountCents;
      else lateCents += amountCents;

      invoices.push({
        id: booking.id,
        number: `DL-${booking.id.slice(-6).toUpperCase()}`,
        dateLabel: `${formatParisDateShort(booking.dateTime)} · ${formatTimeParis(booking.dateTime)}`,
        dateTimeUtcIso: booking.dateTime.toISOString(),
        clientName: booking.client.name,
        dogName: booking.dog.name,
        service: booking.service.title,
        amountCents,
        status,
        bookingHref: `/dashboard/seances/${booking.id}`,
      });
    }

    return {
      success: true,
      data: {
        invoices,
        totalCents: paidCents + pendingCents + lateCents,
        paidCents,
        pendingCents,
        lateCents,
      },
    };
  } catch (error) {
    console.error("[getEducatorBillingOverview]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ?? "Impossible de charger la facturation.",
    };
  }
}

export async function getEducatorRevenueHistory(
  months = 6,
): Promise<ActionResult<EducatorRevenueMonth[]>> {
  const educator = await requireEducatorProfile();
  if (!educator.success) return educator;

  const window = getParisLastMonthsBoundsUtc(months);
  const rangeStart = window[0]?.startUtc;
  const rangeEnd = window[window.length - 1]?.endUtc;

  if (!rangeStart || !rangeEnd) {
    return { success: true, data: [] };
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        educatorProfileId: educator.data.educatorProfileId,
        status: BookingStatus.COMPLETED,
        dateTime: { gte: rangeStart, lte: rangeEnd },
      },
      select: {
        dateTime: true,
        service: { select: { price: true } },
      },
    });

    const totals = new Map<string, number>();
    for (const month of window) {
      totals.set(month.key, 0);
    }

    for (const booking of bookings) {
      const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
      }).format(booking.dateTime);
      const current = totals.get(key);
      if (current === undefined) continue;
      totals.set(key, current + booking.service.price);
    }

    return {
      success: true,
      data: window.map((month) => ({
        key: month.key,
        month: month.monthLabel,
        valueEuros: Math.round((totals.get(month.key) ?? 0) / 100),
      })),
    };
  } catch (error) {
    console.error("[getEducatorRevenueHistory]", error);
    return {
      success: false,
      error: prismaErrorMessage(error) ?? "Impossible de charger les revenus.",
    };
  }
}
