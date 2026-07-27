"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { distanceKm } from "@/lib/geo-distance";
import { prismaErrorMessage } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import type {
  MarketplaceEducatorItem,
  MarketplaceFilterOptions,
} from "@/types/marketplace";

const searchSchema = z.object({
  q: z.string().max(120).optional(),
  city: z.string().max(100).optional(),
  specialty: z.string().max(120).optional(),
  nearLat: z.number().min(-90).max(90).optional(),
  nearLng: z.number().min(-180).max(180).optional(),
  maxRadiusKm: z.number().min(1).max(500).optional(),
});

async function photoUrlByClerkId(
  clerkIds: string[],
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (clerkIds.length === 0) return map;

  const client = await clerkClient();
  await Promise.all(
    clerkIds.map(async (clerkId) => {
      try {
        const user = await client.users.getUser(clerkId);
        map.set(clerkId, user.hasImage ? user.imageUrl : null);
      } catch {
        map.set(clerkId, null);
      }
    }),
  );
  return map;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function getMarketplaceFilterOptions(): Promise<
  ActionResult<MarketplaceFilterOptions>
> {
  try {
    const profiles = await prisma.educatorProfile.findMany({
      where: { services: { some: { isActive: true } } },
      select: {
        city: true,
        services: {
          where: { isActive: true },
          select: { title: true },
        },
      },
      orderBy: { city: "asc" },
    });

    const citySet = new Set<string>();
    const specialtySet = new Set<string>();

    for (const profile of profiles) {
      citySet.add(profile.city);
      for (const service of profile.services) {
        specialtySet.add(service.title);
      }
    }

    const cities = [...citySet].sort((a, b) => a.localeCompare(b, "fr"));
    const specialties = [...specialtySet].sort((a, b) =>
      a.localeCompare(b, "fr"),
    );

    return { success: true, data: { cities, specialties } };
  } catch (error) {
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger les filtres.",
    };
  }
}

export async function searchMarketplaceEducators(
  input: unknown,
): Promise<ActionResult<MarketplaceEducatorItem[]>> {
  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Recherche invalide." };
  }

  const q = normalizeOptional(parsed.data.q);
  const city = normalizeOptional(parsed.data.city);
  const specialty = normalizeOptional(parsed.data.specialty);
  const nearLat = parsed.data.nearLat;
  const nearLng = parsed.data.nearLng;
  const maxRadiusKm = parsed.data.maxRadiusKm ?? 80;

  try {
    const profiles = await prisma.educatorProfile.findMany({
      where: {
        services: {
          some: {
            isActive: true,
            ...(specialty
              ? { title: { equals: specialty, mode: "insensitive" } }
              : {}),
          },
        },
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(q
          ? {
              OR: [
                { city: { contains: q, mode: "insensitive" } },
                { user: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        city: true,
        lat: true,
        lng: true,
        bio: true,
        user: { select: { name: true, clerkId: true } },
        services: {
          where: { isActive: true },
          select: { title: true },
          orderBy: { title: "asc" },
        },
      },
      orderBy: [{ city: "asc" }, { user: { name: "asc" } }],
    });

    const clerkIds = [...new Set(profiles.map((p) => p.user.clerkId))];
    const photos = await photoUrlByClerkId(clerkIds);

    let items: MarketplaceEducatorItem[] = profiles.map((profile) => {
      const specialties = [
        ...new Set(profile.services.map((s) => s.title)),
      ].sort((a, b) => a.localeCompare(b, "fr"));

      let itemDistance: number | null = null;
      if (nearLat != null && nearLng != null) {
        itemDistance = distanceKm(
          nearLat,
          nearLng,
          profile.lat,
          profile.lng,
        );
      }

      return {
        id: profile.id,
        name: profile.user.name,
        city: profile.city,
        bio: profile.bio,
        specialties,
        photoUrl: photos.get(profile.user.clerkId) ?? null,
        distanceKm: itemDistance,
      };
    });

    if (nearLat != null && nearLng != null) {
      items = items.filter(
        (item) =>
          item.distanceKm != null && item.distanceKm <= maxRadiusKm,
      );
      items.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    return { success: true, data: items };
  } catch (error) {
    console.error("[searchMarketplaceEducators]", error);
    return {
      success: false,
      error:
        prismaErrorMessage(error) ??
        "Impossible de charger les éducateurs.",
    };
  }
}
