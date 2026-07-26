import { auth } from "@clerk/nextjs/server";

import { Role } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";

export type EducatorContext = {
  educatorProfileId: string;
  city: string;
  address: string;
};

export async function requireEducatorProfile(): Promise<
  ActionResult<EducatorContext>
> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Vous devez être connecté." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { educatorProfile: true },
    });

    if (!user || user.role !== Role.EDUCATOR || !user.educatorProfile) {
      return { success: false, error: "Profil éducateur introuvable." };
    }

    return {
      success: true,
      data: {
        educatorProfileId: user.educatorProfile.id,
        city: user.educatorProfile.city,
        address: user.educatorProfile.address,
      },
    };
  } catch {
    return { success: false, error: "Impossible de charger le profil éducateur." };
  }
}
