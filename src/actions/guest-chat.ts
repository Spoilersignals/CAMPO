"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

interface GuestInfo {
  name: string;
  phone: string;
  email?: string;
}

export async function startGuestChatAction(
  listingId: string,
  buyerName: string,
  buyerPhone: string,
  buyerEmail: string | undefined,
  message: string
) {
  if (!buyerName.trim() || !buyerPhone.trim()) {
    throw new Error("Name and phone are required");
  }

  if (!message.trim()) {
    throw new Error("Message cannot be empty");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  });

  if (!listing || listing.status !== "ACTIVE") {
    throw new Error("Listing not found or not available");
  }

  const existingThread = await prisma.chatThread.findFirst({
    where: {
      listingId,
      buyerPhone,
      sellerId: listing.sellerId,
    },
  });

  if (existingThread) {
    await prisma.chatMessage.create({
      data: {
        threadId: existingThread.id,
        senderName: buyerName.trim(),
        body: message.trim(),
      },
    });

    await prisma.chatThread.update({
      where: { id: existingThread.id },
      data: { updatedAt: new Date() },
    });

    revalidatePath(`/marketplace/${listingId}`);
    return existingThread;
  }

  const thread = await prisma.chatThread.create({
    data: {
      listingId,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: buyerEmail?.trim() || null,
      sellerId: listing.sellerId,
      messages: {
        create: {
          senderName: buyerName.trim(),
          body: message.trim(),
        },
      },
    },
  });

  revalidatePath(`/marketplace/${listingId}`);
  return thread;
}

export async function sendGuestMessageAction(
  threadId: string,
  buyerName: string,
  message: string
) {
  if (!message.trim()) {
    throw new Error("Message cannot be empty");
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { id: true, buyerName: true, buyerPhone: true },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  const chatMessage = await prisma.chatMessage.create({
    data: {
      threadId,
      senderName: buyerName.trim(),
      body: message.trim(),
    },
  });

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/api/messages`);
  return chatMessage;
}

export async function getThreadMessagesAction(threadId: string) {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
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
      buyerName: thread.buyerName,
      buyerPhone: thread.buyerPhone,
      supportRequested: thread.supportRequested,
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
            imageUrl: thread.listing.photos[0]?.url || null,
          }
        : undefined,
    },
    messages: thread.messages.map((msg) => ({
      id: msg.id,
      content: msg.body,
      timestamp: msg.createdAt,
      senderId: msg.senderId,
      senderName: msg.senderName || msg.sender?.name || "Unknown",
      isRead: !!msg.readAt,
      isFromSeller: !!msg.senderId,
    })),
  };
}

export async function requestSupportAction(
  threadId: string,
  subject: string,
  description: string
) {
  if (!subject.trim() || !description.trim()) {
    throw new Error("Subject and description are required");
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      buyerName: true,
      buyerPhone: true,
      buyerEmail: true,
    },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      threadId,
      subject: subject.trim(),
      description: description.trim(),
      buyerName: thread.buyerName,
      buyerPhone: thread.buyerPhone,
      buyerEmail: thread.buyerEmail,
    },
  });

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { supportRequested: true },
  });

  revalidatePath(`/api/messages`);
  return ticket;
}
