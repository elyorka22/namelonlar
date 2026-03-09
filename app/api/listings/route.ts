import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      categoryId,
      images,
      location,
      city,
      contactPhone,
      contactEmail,
      contactTelegram,
    } = body;

    if (!title || !description || !categoryId || !images || images.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: price || null,
        categoryId,
        userId: user.id,
        images,
        location,
        city,
        contactPhone,
        contactEmail,
        contactTelegram,
        status: ListingStatus.MODERATION,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    const message =
      error && typeof (error as { code?: string }).code === "string"
        ? "Ma'lumotlar bazasi xatosi. Loyihada DATABASE_URL tekshirilsin."
        : "Ichki xatolik. Keyinroq urinib ko'ring.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

