import { personInitials, splitPersonName } from "@/lib/person-name";
import type { ClientBookingItem } from "@/types/client-dashboard";

export type ClientRecentReport = {
  id: string;
  dogId: string;
  educatorInitials: string;
  educatorLabel: string;
  dogName: string;
  excerpt: string;
  dateLabel: string;
};

function formatShortParisDate(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(utc);
}

function formatLongParisDate(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(utc);
}

export function daysUntilParisDate(dateParis: string): number | null {
  const [y, m, d] = dateParis.split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const now = new Date();
  const todayParis = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [ty, tm, td] = todayParis.split("-").map(Number);
  const today = new Date(Date.UTC(ty, tm - 1, td, 12, 0, 0));
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function buildClientRecentReports(
  past: ClientBookingItem[],
  limit = 3,
): ClientRecentReport[] {
  return past
    .filter(
      (b) =>
        b.postSessionReport != null && b.postSessionReport.trim().length > 0,
    )
    .slice(0, limit)
    .map((b) => {
      const { firstName, lastName } = splitPersonName(b.educatorName);
      const excerpt =
        b.postSessionReport!.trim().length > 140
          ? `${b.postSessionReport!.trim().slice(0, 137)}…`
          : b.postSessionReport!.trim();
      return {
        id: b.id,
        dogId: b.dogId,
        educatorInitials: personInitials(firstName, lastName),
        educatorLabel: `${b.educatorName} · éducateur`,
        dogName: b.dogName,
        excerpt,
        dateLabel: formatLongParisDate(b.dateParis),
      };
    });
}

export function formatNextReservationTimeRange(
  booking: ClientBookingItem,
): string {
  const endMinutes =
    parseInt(booking.timeParis.split(":")[0] ?? "0", 10) * 60 +
    parseInt(booking.timeParis.split(":")[1] ?? "0", 10) +
    booking.durationMinutes;
  const endH = Math.floor(endMinutes / 60) % 24;
  const endM = endMinutes % 60;
  const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  return `${booking.timeParis} — ${end}`;
}

export { formatShortParisDate, formatLongParisDate };
