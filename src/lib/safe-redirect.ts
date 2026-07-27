export function safeRelativeRedirect(
  url: string | undefined,
  fallback: string,
): string {
  if (url && url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return fallback;
}

export function authContinueUrl(redirectUrl?: string): string {
  if (
    redirectUrl &&
    redirectUrl.startsWith("/") &&
    !redirectUrl.startsWith("//")
  ) {
    return `/auth/continue?redirect_url=${encodeURIComponent(redirectUrl)}`;
  }
  return "/auth/continue";
}
