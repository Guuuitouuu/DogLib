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
  const { year, month, day } = getParisYmd(reference);
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
