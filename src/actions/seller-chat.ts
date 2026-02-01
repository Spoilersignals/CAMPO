"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface GuestInfo {
  name: string;
  phone: string;
  email?: string;
}

export async function getOrCreateChatThread(
  listingId: string,
  guestInfo?: GuestInfo
) {
  const session = await auth();
  const userId = session?.user?.id;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true, title: true },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (userId === listing.sellerId) {
    throw new Error("Cannot chat with yourself");
  }

  if (userId) {
    const existingThread = await prisma.chatThread.findFirst({
      where: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
    });

    if (existingThread) {
      return existingThread;
    }

    const thread = await prisma.chatThread.create({
      data: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
    });

    revalidatePath(`/marketplace/${listingId}/chat`);
    return thread;
  }

  if (!guestInfo?.name || !guestInfo?.phone) {
    throw new Error("Guest info required");
  }

  const existingThread = await prisma.chatThread.findFirst({
    where: {
      listingId,
      buyerPhone: guestInfo.phone,
      sellerId: listing.sellerId,
    },
  });

  if (existingThread) {
    return existingThread;
  }

  const thread = await prisma.chatThread.create({
    data: {
      listingId,
      buyerName: guestInfo.name.trim(),
      buyerPhone: guestInfo.phone.trim(),
      buyerEmail: guestInfo.email?.trim() || null,
      sellerId: listing.sellerId,
    },
  });

  revalidatePath(`/marketplace/${listingId}/chat`);
  return thread;
}

export async function sendMessage(
  threadId: string,
  content: string,
  isFromSeller: boolean,
  senderName?: string
) {
  if (!content.trim()) {
    throw new Error("Message cannot be empty");
  }

  const session = await auth();
  const userId = session?.user?.id;

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { buyerId: true, sellerId: true, buyerName: true },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  if (userId) {
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      throw new Error("Unauthorized");
    }
  }

  const message = await prisma.chatMessage.create({
    data: {
      threadId,
      senderId: userId || null,
      senderName: senderName?.trim() || null,
      body: content.trim(),
    },
  });

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/marketplace`);
  revalidatePath(`/dashboard/chats`);

  return message;
}

export async function getMessages(threadId: string) {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
          seller: { select: { id: true, name: true, image: true } },
        },
      },
      seller: {
        select: { id: true, name: true, image: true, isVerified: true },
      },
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

  return {
    thread: {
      id: thread.id,
      buyerId: thread.buyerId,
      buyerName: thread.buyerName,
      buyerPhone: thread.buyerPhone,
      sellerId: thread.sellerId,
      seller: {
        id: thread.seller.id,
        name: thread.seller.name || "Seller",
        avatarUrl: thread.seller.image,
        isVerified: thread.seller.isVerified,
      },
      listing: thread.listing
        ? {
            id: thread.listing.id,
            title: thread.listing.title,
            price: thread.listing.price,
            imageUrl: thread.listing.photos[0]?.url || null,
            sellerId: thread.listing.seller.id,
            sellerName: thread.listing.seller.name,
          }
        : null,
    },
    messages: thread.messages.map((msg) => ({
      id: msg.id,
      content: msg.body,
      timestamp: msg.createdAt,
      senderId: msg.senderId,
      senderName: msg.senderName || msg.sender?.name || "Unknown",
      isRead: !!msg.readAt,
      isFromSeller: msg.senderId === thread.sellerId,
    })),
  };
}

export async function getMyChats() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const threads = await prisma.chatThread.findMany({
    where: {
      sellerId: session.user.id,
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: session.user.id },
              readAt: null,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return threads.map((thread) => ({
    id: thread.id,
    buyerName: thread.buyerName || "Registered User",
    buyerId: thread.buyerId,
    listing: thread.listing
      ? {
          id: thread.listing.id,
          title: thread.listing.title,
          price: thread.listing.price,
          imageUrl: thread.listing.photos[0]?.url || null,
        }
      : null,
    lastMessage: thread.messages[0]
      ? {
          content: thread.messages[0].body,
          timestamp: thread.messages[0].createdAt,
        }
      : null,
    unreadCount: thread._count.messages,
    updatedAt: thread.updatedAt,
  }));
}

export async function markThreadAsRead(threadId: string) {
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

  revalidatePath(`/dashboard/chats`);
}

export async function getListingForChat(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      seller: { select: { id: true, name: true, image: true } },
    },
  });

  if (!listing) {
    return null;
  }

  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    status: listing.status,
    imageUrl: listing.photos[0]?.url || null,
    seller: {
      id: listing.seller.id,
      name: listing.seller.name || "Seller",
      avatarUrl: listing.seller.image,
    },
  };
}
