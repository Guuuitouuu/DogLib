import { NotificationType } from "@/generated/prisma/client";
import { formatTimeParis, toParisDateString } from "@/lib/paris-time";
import { prisma } from "@/lib/prisma";

function formatBookingWhen(dateTime: Date): string {
  const dateParis = toParisDateString(dateTime);
  const timeParis = formatTimeParis(dateTime);
  return `${dateParis} à ${timeParis}`;
}

async function educatorUserIdFromProfile(
  educatorProfileId: string,
): Promise<string | null> {
  const profile = await prisma.educatorProfile.findUnique({
    where: { id: educatorProfileId },
    select: { userId: true },
  });
  return profile?.userId ?? null;
}

export async function notifyEducatorBookingRequest(input: {
  educatorProfileId: string;
  bookingId: string;
  clientName: string;
  dogName: string;
  serviceTitle: string;
  dateTime: Date;
}): Promise<void> {
  const userId = await educatorUserIdFromProfile(input.educatorProfileId);
  if (!userId) return;

  await prisma.notification.create({
    data: {
      userId,
      type: NotificationType.BOOKING_REQUEST,
      title: "Nouvelle demande de réservation",
      body: `${input.clientName} · ${input.dogName} — ${input.serviceTitle} · ${formatBookingWhen(input.dateTime)} (en attente de confirmation).`,
      bookingId: input.bookingId,
    },
  });
}

export async function notifyEducatorBookingCancelledByClient(input: {
  educatorProfileId: string;
  bookingId: string;
  clientName: string;
  dogName: string;
  serviceTitle: string;
  dateTime: Date;
}): Promise<void> {
  const userId = await educatorUserIdFromProfile(input.educatorProfileId);
  if (!userId) return;

  await prisma.notification.create({
    data: {
      userId,
      type: NotificationType.BOOKING_CANCELLED_BY_CLIENT,
      title: "Réservation annulée par le client",
      body: `${input.clientName} · ${input.dogName} — ${input.serviceTitle} · ${formatBookingWhen(input.dateTime)}.`,
      bookingId: input.bookingId,
    },
  });
}
