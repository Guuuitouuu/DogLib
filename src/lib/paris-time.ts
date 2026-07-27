const PARIS = "Europe/Paris";

function getParisOffsetMs(at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(at);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - at.getTime();
}

function parisWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, ms);
  const offset = getParisOffsetMs(new Date(utcGuess));
  return new Date(utcGuess - offset);
}

function getParisYmd(reference: Date): { year: number; month: number; day: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = dtf.formatToParts(reference);
  return {
    year: Number(parts.find((p) => p.type === "year")!.value),
    month: Number(parts.find((p) => p.type === "month")!.value),
    day: Number(parts.find((p) => p.type === "day")!.value),
  };
}

/** Bornes UTC du jour civil courant à Paris (inclus). */
export function getParisDayBoundsUtc(reference = new Date()): {
  startUtc: Date;
  endUtc: Date;
} {
  const { year, month, day } = getParisYmd(reference);
  return {
    startUtc: parisWallTimeToUtc(year, month, day, 0, 0, 0, 0),
    endUtc: parisWallTimeToUtc(year, month, day, 23, 59, 59, 999),
  };
}

/** Du 1er du mois (Paris) 00:00 au jour courant (Paris) 23:59:59.999, en UTC. */
export function getParisMonthToTodayBoundsUtc(reference = new Date()): {
  startUtc: Date;
  endUtc: Date;
} {
  const { year, month } = getParisYmd(reference);
  const { endUtc } = getParisDayBoundsUtc(reference);
  return {
    startUtc: parisWallTimeToUtc(year, month, 1, 0, 0, 0, 0),
    endUtc,
  };
}

export function formatTimeParis(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatParisDayLabel(reference = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(reference);
}

export function parisDateStringToBounds(dateStr: string): {
  startUtc: Date;
  endUtc: Date;
} {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid date string");
  }
  return {
    startUtc: parisWallTimeToUtc(year, month, day, 0, 0, 0, 0),
    endUtc: parisWallTimeToUtc(year, month, day, 23, 59, 59, 999),
  };
}

export function getParisWeekdayFromDateString(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const noonUtc = parisWallTimeToUtc(year, month, day, 12, 0, 0, 0);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS,
    weekday: "long",
  }).format(noonUtc);
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[weekday] ?? 0;
}

export function parisSlotStartUtc(
  dateStr: string,
  hour: number,
  minute: number,
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return parisWallTimeToUtc(year, month, day, hour, minute, 0, 0);
}

export function toParisDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const PARIS_WEEKDAY_SHORT = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."] as const;

export function addParisDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return toParisDateString(parisWallTimeToUtc(y, m, d + delta, 12, 0, 0, 0));
}

/** Lundi → dimanche (semaine civil Paris), avec décalage de semaines. */
export function getParisWeekBoundsUtc(
  reference = new Date(),
  weekOffset = 0,
): {
  startUtc: Date;
  endUtc: Date;
  weekStartDateStr: string;
  days: {
    dateStr: string;
    dayOfMonth: number;
    weekdayShort: string;
    weekdayIndex: number;
  }[];
} {
  const anchor = new Date(reference.getTime() + weekOffset * 7 * 86_400_000);
  const anchorStr = toParisDateString(anchor);
  const weekday = getParisWeekdayFromDateString(anchorStr);
  const daysFromMonday = (weekday + 6) % 7;

  let mondayStr = anchorStr;
  for (let i = 0; i < daysFromMonday; i++) {
    mondayStr = addParisDays(mondayStr, -1);
  }

  const days: {
    dateStr: string;
    dayOfMonth: number;
    weekdayShort: string;
    weekdayIndex: number;
  }[] = [];

  for (let i = 0; i < 7; i++) {
    const dateStr = addParisDays(mondayStr, i);
    const dayOfMonth = Number(dateStr.split("-")[2]);
    const w = getParisWeekdayFromDateString(dateStr);
    days.push({
      dateStr,
      dayOfMonth,
      weekdayShort: PARIS_WEEKDAY_SHORT[w] ?? "",
      weekdayIndex: w,
    });
  }

  const lastDay = days[6]!;
  const { startUtc } = parisDateStringToBounds(mondayStr);
  const { endUtc } = parisDateStringToBounds(lastDay.dateStr);

  return {
    startUtc,
    endUtc,
    weekStartDateStr: mondayStr,
    days,
  };
}

export function formatParisWeekRangeLabel(
  weekStartDateStr: string,
  weekEndDateStr: string,
): string {
  const [sy, sm, sd] = weekStartDateStr.split("-").map(Number);
  const [ey, em, ed] = weekEndDateStr.split("-").map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, sd));
  const end = new Date(Date.UTC(ey, em - 1, ed));
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: sy !== ey ? "numeric" : undefined,
  });
  const startLabel = fmt.format(start);
  const endLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end);
  return `${startLabel} — ${endLabel}`;
}

/** Mois civil Paris complet (1er → dernier jour). */
export function getParisMonthBoundsUtc(reference = new Date()): {
  startUtc: Date;
  endUtc: Date;
} {
  const { year, month } = getParisYmd(reference);
  const lastDayUtc = parisWallTimeToUtc(year, month + 1, 0, 23, 59, 59, 999);
  return {
    startUtc: parisWallTimeToUtc(year, month, 1, 0, 0, 0, 0),
    endUtc: lastDayUtc,
  };
}

export function getParisDayBoundsFromDateStr(dateStr: string): {
  startUtc: Date;
  endUtc: Date;
} {
  return parisDateStringToBounds(dateStr);
}

export const defaultAgendaHours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;
