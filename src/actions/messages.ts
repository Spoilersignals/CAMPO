"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createThread(listingId: string, sellerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.id === sellerId) {
    throw new Error("Cannot message yourself");
  }

  const existing = await prisma.chatThread.findFirst({
    where: {
      listingId,
      buyerId: session.user.id,
      sellerId,
    },
  });

  if (existing) {
    return existing;
  }

  const thread = await prisma.chatThread.create({
    data: {
      listingId,
      buyerId: session.user.id,
      sellerId,
    },
  });

  revalidatePath("/messages");
  return thread;
}

export async function sendMessage(threadId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!content.trim()) {
    throw new Error("Message cannot be empty");
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { buyerId: true, sellerId: true },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  if (thread.buyerId !== session.user.id && thread.sellerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const message = await prisma.chatMessage.create({
    data: {
      threadId,
      senderId: session.user.id,
      body: content.trim(),
    },
  });

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/messages/${threadId}`);
  revalidatePath("/messages");

  return message;
}

export async function markAsRead(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { buyerId: true, sellerId: true },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  if (thread.buyerId !== session.user.id && thread.sellerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.chatMessage.updateMany({
    where: {
      threadId,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath(`/messages/${threadId}`);
  revalidatePath("/messages");
}

export async function getMyThreads() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const threads = await prisma.chatThread.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ],
    },
    include: {
      listing: {
        include: {
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      seller: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return threads.map((thread: typeof threads[number]) => {
    const isBuyer = thread.buyerId === session.user!.id;
    const lastMessage = thread.messages[0];

    const otherUser = isBuyer
      ? { id: thread.seller.id, name: thread.seller.name, image: thread.seller.image }
      : { id: thread.buyerId, name: thread.buyerName, image: null };

    return {
      id: thread.id,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name || "Unknown User",
        avatarUrl: otherUser.image,
      },
      listing: {
        id: thread.listing?.id || "",
        title: thread.listing?.title || "Deleted Listing",
        imageUrl: thread.listing?.photos[0]?.url || null,
      },
      lastMessage: lastMessage
        ? {
            content: lastMessage.body,
            timestamp: lastMessage.createdAt,
            isFromCurrentUser: lastMessage.senderId === session.user!.id,
          }
        : undefined,
      unreadCount: 0,
    };
  });
}

export async function getThreadMessages(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      listing: {
        include: {
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      seller: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  if (thread.buyerId !== session.user.id && thread.sellerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const isBuyer = thread.buyerId === session.user.id;
  const otherUser = isBuyer
    ? { id: thread.seller.id, name: thread.seller.name, image: thread.seller.image }
    : { id: thread.buyerId, name: thread.buyerName, image: null };

  return {
    thread: {
      id: thread.id,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name || "Unknown User",
        avatarUrl: otherUser.image,
      },
      listing: thread.listing
        ? {
            id: thread.listing.id,
            title: thread.listing.title,
            imageUrl: thread.listing.photos[0]?.url || null,
          }
        : undefined,
    },
    messages: thread.messages.map((msg: typeof thread.messages[number]) => ({
      id: msg.id,
      content: msg.body,
      timestamp: msg.createdAt,
      senderId: msg.senderId,
      isRead: !!msg.readAt,
    })),
  };
}
