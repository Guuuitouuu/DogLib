const HM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseHmToMinutes(value: string): number | null {
  const match = HM_REGEX.exec(value);
  if (!match) return null;
  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}

export function isValidHm(value: string): boolean {
  return parseHmToMinutes(value) !== null;
}

export function isHmRangeValid(startTime: string, endTime: string): boolean {
  const start = parseHmToMinutes(startTime);
  const end = parseHmToMinutes(endTime);
  if (start === null || end === null) return false;
  return start < end;
}

export const weekdayLabelsFr = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;
