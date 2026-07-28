import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function validateImageFile(file: File): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return "Fichier invalide.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image trop volumineuse (max. 5 Mo).";
  }
  if (!MIME_TO_EXT[file.type]) {
    return "Format non pris en charge (JPEG, PNG, WebP ou GIF).";
  }
  return null;
}

/** Enregistre l'image dans public/uploads et retourne le chemin public (/uploads/…). */
export async function saveUploadedImageFile(
  file: File,
  pathSegments: string[],
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = MIME_TO_EXT[file.type]!;
  const safeSegments = pathSegments.map((s) =>
    s.replace(/[^a-zA-Z0-9_-]/g, ""),
  );
  const fileName = `${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", ...safeSegments);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, fileName), buffer);

  return `/${relativeDir.replace(/\\/g, "/")}/${fileName}`;
}
