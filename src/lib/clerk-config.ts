/**
 * True when a real Clerk publishable key is present (pk_test_ / pk_live_).
 * Avoids crashing public pages when Clerk env vars are missing or dummy on Vercel.
 */
export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  if (!key.startsWith("pk_test_") && !key.startsWith("pk_live_")) {
    return false;
  }
  // Reject placeholders like "pk_test_dummy"
  return key.length >= 32;
}
