import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body; // 'vip', 'top', 'bump'

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!listing || listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};

    if (type === "vip") {
      updateData.isVip = true;
      updateData.featuredUntil = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ); // 7 days
    } else if (type === "top") {
      updateData.isTop = true;
      updateData.featuredUntil = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ); // 3 days
    } else if (type === "bump") {
      updateData.bumpedAt = new Date();
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error promoting listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

