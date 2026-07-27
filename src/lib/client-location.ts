import type { AppUserLookup } from "@/lib/db-user";

export function clientAddressIsComplete(
  user: Pick<AppUserLookup, "address" | "lat" | "lng">,
): boolean {
  return Boolean(
    user.address?.trim() && user.lat != null && user.lng != null,
  );
}
