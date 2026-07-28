import { z } from "zod";

export const mediaUrlSchema = z
  .string()
  .max(2048)
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    "URL invalide (https://… ou chemin /…).",
  );

export function parseOptionalMediaUrl(
  value: string | undefined,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = mediaUrlSchema.safeParse(trimmed);
  return parsed.success ? trimmed : null;
}

export const EDUCATOR_BANNER_PRESETS = [
  { label: "Forêt", url: "/dogs/dog-3.png" },
  { label: "Parc", url: "/dogs/dog-1.png" },
  { label: "Promenade", url: "/dogs/dog-5.png" },
  { label: "Éducation", url: "/dogs/hero-trainer.png" },
] as const;
