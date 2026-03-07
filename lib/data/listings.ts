import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

export async function getListings(params?: {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, returning empty array");
      return [];
    }
    const where: any = {
      status: ListingStatus.ACTIVE,
    };

    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params?.minPrice !== undefined) {
      where.price = { ...where.price, gte: params.minPrice };
    }

    if (params?.maxPrice !== undefined) {
      where.price = { ...where.price, lte: params.maxPrice };
    }

    if (params?.city) {
      where.city = { contains: params.city, mode: "insensitive" };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isBusiness: true,
            businessName: true,
          },
        },
        category: true,
      },
      orderBy: [
        { isTop: "desc" },
        { isVip: "desc" },
        { featuredUntil: "desc" },
        { bumpedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: params?.limit || 20,
      skip: params?.offset || 0,
    });

    return listings;
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
}

export async function getListingById(id: string) {
  try {
    if (!process.env.DATABASE_URL) {
      return null;
    }
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
            telegramUsername: true,
            isBusiness: true,
            businessName: true,
            businessLogo: true,
          },
        },
        category: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (listing) {
      await prisma.listing.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return listing;
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
}

export async function getFeaturedListings() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, returning empty array");
      return [];
    }
    const listings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        OR: [
          { isVip: true },
          { isTop: true },
          { featuredUntil: { gt: new Date() } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isBusiness: true,
            businessName: true,
          },
        },
        category: true,
      },
      orderBy: [
        { isTop: "desc" },
        { isVip: "desc" },
        { featuredUntil: "desc" },
      ],
      take: 8,
    });

    return listings;
  } catch (error) {
    console.error("Error fetching featured listings:", error);
    return [];
  }
}

export async function getNewListings(limit: number = 12) {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, returning empty array");
      return [];
    }
    const listings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isBusiness: true,
            businessName: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return listings;
  } catch (error) {
    console.error("Error fetching new listings:", error);
    return [];
  }
}

export async function getSimilarListings(
  listingId: string,
  categoryId: string,
  limit: number = 6
) {
  try {
    if (!process.env.DATABASE_URL) {
      return [];
    }
    const listings = await prisma.listing.findMany({
      where: {
        id: { not: listingId },
        categoryId,
        status: ListingStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isBusiness: true,
            businessName: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return listings;
  } catch (error) {
    console.error("Error fetching similar listings:", error);
    return [];
  }
}

