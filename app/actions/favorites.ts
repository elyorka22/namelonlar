"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(listingId: string) {
  try {
    const currentUser = await requireAuth();

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: currentUser.id,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      });
      return { success: true, isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: {
          userId: currentUser.id,
          listingId,
        },
      });
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: "Failed to toggle favorite" };
  }
}

