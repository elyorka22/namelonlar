import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const listingId = searchParams.get("listingId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: session.user.id,
            participant2Id: userId,
            listingId: listingId || null,
          },
          {
            participant1Id: userId,
            participant2Id: session.user.id,
            listingId: listingId || null,
          },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation && listingId) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: session.user.id,
          participant2Id: userId,
          listingId,
        },
        include: {
          messages: true,
        },
      });
    }

    return NextResponse.json({
      conversation,
      messages: conversation?.messages || [],
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, listingId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: session.user.id,
            participant2Id: receiverId,
            listingId: listingId || null,
          },
          {
            participant1Id: receiverId,
            participant2Id: session.user.id,
            listingId: listingId || null,
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: session.user.id,
          participant2Id: receiverId,
          listingId: listingId || null,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        receiverId,
        content,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

