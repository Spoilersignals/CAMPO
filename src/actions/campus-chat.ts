"use server";

import { prisma } from "@/lib/prisma";
import { containsAbusiveContent, filterAbusiveContent, ANONYMOUS_MESSAGE_LIMIT } from "@/lib/moderation";
import { headers } from "next/headers";

export type CampusChatMessage = {
  id: string;
  content: string;
  sessionId: string;
  isRegistered: boolean;
  userName: string | null;
  userImage: string | null;
  createdAt: Date;
  isFiltered: boolean;
};

/**
 * Get the client's IP address
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Check and get anonymous chat limit for IP
 */
export async function getAnonymousChatLimit(ipAddress?: string): Promise<{
  messagesUsed: number;
  messagesRemaining: number;
  isLimited: boolean;
}> {
  const ip = ipAddress || await getClientIP();
  
  const limit = await prisma.anonymousChatLimit.findUnique({
    where: { ipAddress: ip },
  });
  
  if (!limit) {
    return {
      messagesUsed: 0,
      messagesRemaining: ANONYMOUS_MESSAGE_LIMIT,
      isLimited: false,
    };
  }
  
  // Check if we need to reset (24 hours)
  const now = new Date();
  const lastReset = new Date(limit.lastResetAt);
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceReset >= 24) {
    // Reset the counter
    await prisma.anonymousChatLimit.update({
      where: { ipAddress: ip },
      data: { messageCount: 0, lastResetAt: now },
    });
    return {
      messagesUsed: 0,
      messagesRemaining: ANONYMOUS_MESSAGE_LIMIT,
      isLimited: false,
    };
  }
  
  return {
    messagesUsed: limit.messageCount,
    messagesRemaining: Math.max(0, ANONYMOUS_MESSAGE_LIMIT - limit.messageCount),
    isLimited: limit.messageCount >= ANONYMOUS_MESSAGE_LIMIT,
  };
}

/**
 * Send a message to the campus chat
 */
export async function sendChatMessage(
  content: string,
  sessionId: string,
  userId?: string
): Promise<{
  success: boolean;
  error?: string;
  message?: CampusChatMessage;
  messagesRemaining?: number;
}> {
  try {
    // Validate content
    if (!content.trim()) {
      return { success: false, error: "Message cannot be empty" };
    }
    
    if (content.length > 500) {
      return { success: false, error: "Message too long (max 500 characters)" };
    }
    
    const ip = await getClientIP();
    
    // Check if anonymous user is limited
    if (!userId) {
      const limit = await getAnonymousChatLimit(ip);
      if (limit.isLimited) {
        return { 
          success: false, 
          error: "Daily message limit reached. Create an account to chat unlimited!",
          messagesRemaining: 0,
        };
      }
    }
    
    // Check for abusive content
    const isAbusive = containsAbusiveContent(content);
    if (isAbusive) {
      // Don't save the message, return error
      return { 
        success: false, 
        error: "Your message contains inappropriate content and was not sent.",
      };
    }
    
    // Filter any borderline content
    const filteredContent = filterAbusiveContent(content);
    const wasFiltered = filteredContent !== content;
    
    // Create the message
    const message = await prisma.campusChatMessage.create({
      data: {
        content: filteredContent,
        sessionId,
        userId,
        ipAddress: ip,
        isFiltered: wasFiltered,
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });
    
    // Update anonymous limit if not registered
    if (!userId) {
      await prisma.anonymousChatLimit.upsert({
        where: { ipAddress: ip },
        create: {
          ipAddress: ip,
          messageCount: 1,
          lastResetAt: new Date(),
        },
        update: {
          messageCount: { increment: 1 },
        },
      });
    }
    
    const newLimit = await getAnonymousChatLimit(ip);
    
    return {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        sessionId: message.sessionId,
        isRegistered: !!message.userId,
        userName: message.user?.name || null,
        userImage: message.user?.image || null,
        createdAt: message.createdAt,
        isFiltered: message.isFiltered,
      },
      messagesRemaining: userId ? undefined : newLimit.messagesRemaining,
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Get campus chat messages
 */
export async function getChatMessages(
  limit: number = 50,
  cursor?: string
): Promise<{
  success: boolean;
  messages: CampusChatMessage[];
  nextCursor?: string;
}> {
  try {
    const messages = await prisma.campusChatMessage.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });
    
    let nextCursor: string | undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }
    
    return {
      success: true,
      messages: messages.reverse().map((msg) => ({
        id: msg.id,
        content: msg.content,
        sessionId: msg.sessionId,
        isRegistered: !!msg.userId,
        userName: msg.user?.name || null,
        userImage: msg.user?.image || null,
        createdAt: msg.createdAt,
        isFiltered: msg.isFiltered,
      })),
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return { success: false, messages: [] };
  }
}

/**
 * Get new messages since a given message ID (for polling)
 */
export async function getNewMessages(sinceId: string): Promise<{
  success: boolean;
  messages: CampusChatMessage[];
}> {
  try {
    const sinceMessage = await prisma.campusChatMessage.findUnique({
      where: { id: sinceId },
    });
    
    if (!sinceMessage) {
      return { success: false, messages: [] };
    }
    
    const messages = await prisma.campusChatMessage.findMany({
      where: {
        createdAt: { gt: sinceMessage.createdAt },
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });
    
    return {
      success: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sessionId: msg.sessionId,
        isRegistered: !!msg.userId,
        userName: msg.user?.name || null,
        userImage: msg.user?.image || null,
        createdAt: msg.createdAt,
        isFiltered: msg.isFiltered,
      })),
    };
  } catch (error) {
    console.error("Error fetching new messages:", error);
    return { success: false, messages: [] };
  }
}
