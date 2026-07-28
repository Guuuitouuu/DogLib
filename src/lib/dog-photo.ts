/** Illustration par défaut si le propriétaire n'a pas encore choisi de photo. */
export function defaultDogPhotoPath(dogId: string): string {
  let hash = 0;
  for (let i = 0; i < dogId.length; i++) {
    hash = (hash + dogId.charCodeAt(i)) % 5;
  }
  return `/dogs/dog-${hash + 1}.png`;
}

export function resolveDogPhotoSrc(
  dogId: string,
  photoUrl: string | null | undefined,
): string {
  const trimmed = photoUrl?.trim();
  if (trimmed) return trimmed;
  return defaultDogPhotoPath(dogId);
}
