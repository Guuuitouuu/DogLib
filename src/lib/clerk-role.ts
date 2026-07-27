import { Role } from "@/generated/prisma/client";

export function resolveClerkRole(metadata: unknown): Role | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const role = (metadata as { role?: unknown }).role;
  if (role === "EDUCATOR") return Role.EDUCATOR;
  if (role === "CLIENT") return Role.CLIENT;
  return undefined;
}

export function isClerkRoleSet(metadata: unknown): boolean {
  return resolveClerkRole(metadata) !== undefined;
}
