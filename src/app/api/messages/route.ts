import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");
  const after = searchParams.get("after");

  if (!threadId) {
    return Response.json({ error: "threadId is required" }, { status: 400 });
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      buyerId: true,
      buyerPhone: true,
      sellerId: true,
    },
  });

  if (!thread) {
    return Response.json({ error: "Thread not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user?.id;
  const isSeller = session?.user?.id === thread.sellerId;
  const isBuyer = session?.user?.id === thread.buyerId;
  const isAdmin = session?.user && (session.user as { role?: string }).role === "ADMIN";

  const isGuest = !isAuthenticated && !!thread.buyerPhone;

  if (!isSeller && !isBuyer && !isAdmin && !isGuest) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      threadId,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  return Response.json({
    messages: messages.map((msg) => ({
      id: msg.id,
      content: msg.body,
      timestamp: msg.createdAt.toISOString(),
      senderId: msg.senderId,
      senderName: msg.senderName || msg.sender?.name || "Unknown",
      isRead: !!msg.readAt,
      isFromSeller: !!msg.senderId,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, message, senderName } = body;

    if (!threadId || !message?.trim()) {
      return Response.json(
        { error: "threadId and message are required" },
        { status: 400 }
      );
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        buyerId: true,
        buyerPhone: true,
        sellerId: true,
      },
    });

    if (!thread) {
      return Response.json({ error: "Thread not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user?.id;
    const isSeller = session?.user?.id === thread.sellerId;
    const isBuyer = session?.user?.id === thread.buyerId;

    if (isAuthenticated) {
      if (!isSeller && !isBuyer) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const chatMessage = await prisma.chatMessage.create({
        data: {
          threadId,
          senderId: session.user!.id,
          body: message.trim(),
        },
      });

      await prisma.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      });

      return Response.json({
        id: chatMessage.id,
        content: chatMessage.body,
        timestamp: chatMessage.createdAt.toISOString(),
        senderId: chatMessage.senderId,
        isRead: false,
        isFromSeller: true,
      });
    } else {
      if (!senderName?.trim()) {
        return Response.json(
          { error: "senderName is required for guest messages" },
          { status: 400 }
        );
      }

      const chatMessage = await prisma.chatMessage.create({
        data: {
          threadId,
          senderName: senderName.trim(),
          body: message.trim(),
        },
      });

      await prisma.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      });

      return Response.json({
        id: chatMessage.id,
        content: chatMessage.body,
        timestamp: chatMessage.createdAt.toISOString(),
        senderName: chatMessage.senderName,
        isRead: false,
        isFromSeller: false,
      });
    }
  } catch {
    return Response.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
