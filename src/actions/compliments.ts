"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getCompliments(
  page: number = 1,
  limit: number = 20
): Promise<
  ActionResult<{
    compliments: Array<{
      id: string;
      recipientName: string;
      recipientHint: string | null;
      message: string;
      complimentNumber: number | null;
      createdAt: Date;
      reactionCounts: Record<string, number>;
      totalReactions: number;
    }>;
    total: number;
    hasMore: boolean;
  }>
> {
  try {
    const skip = (page - 1) * limit;

    const [compliments, total] = await Promise.all([
      prisma.secretCompliment.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          reactions: true,
        },
      }),
      prisma.secretCompliment.count({ where: { status: "APPROVED" } }),
    ]);

    const formattedCompliments = compliments.map((compliment) => {
      const reactionCounts: Record<string, number> = {};
      compliment.reactions.forEach((r) => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
      });

      return {
        id: compliment.id,
        recipientName: compliment.recipientName,
        recipientHint: compliment.recipientHint,
        message: compliment.message,
        complimentNumber: compliment.complimentNumber,
        createdAt: compliment.createdAt,
        reactionCounts,
        totalReactions: compliment.reactions.length,
      };
    });

    return {
      success: true,
      data: {
        compliments: formattedCompliments,
        total,
        hasMore: skip + compliments.length < total,
      },
    };
  } catch (error) {
    console.error("getCompliments error:", error);
    return { success: false, error: "Failed to fetch compliments" };
  }
}

export async function getComplimentById(id: string): Promise<
  ActionResult<{
    id: string;
    recipientName: string;
    recipientHint: string | null;
    message: string;
    complimentNumber: number | null;
    createdAt: Date;
    reactionCounts: Record<string, number>;
    totalReactions: number;
    userReactions: string[];
  }>
> {
  try {
    const sessionId = await getSessionId();

    const compliment = await prisma.secretCompliment.findUnique({
      where: { id },
      include: {
        reactions: true,
      },
    });

    if (!compliment) {
      return { success: false, error: "Compliment not found" };
    }

    if (compliment.status !== "APPROVED") {
      return { success: false, error: "Compliment not available" };
    }

    const reactionCounts: Record<string, number> = {};
    const userReactions: string[] = [];
    compliment.reactions.forEach((r) => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
      if (r.sessionId === sessionId) {
        userReactions.push(r.emoji);
      }
    });

    return {
      success: true,
      data: {
        id: compliment.id,
        recipientName: compliment.recipientName,
        recipientHint: compliment.recipientHint,
        message: compliment.message,
        complimentNumber: compliment.complimentNumber,
        createdAt: compliment.createdAt,
        reactionCounts,
        totalReactions: compliment.reactions.length,
        userReactions,
      },
    };
  } catch (error) {
    console.error("getComplimentById error:", error);
    return { success: false, error: "Failed to fetch compliment" };
  }
}

export async function createCompliment(
  recipientName: string,
  recipientHint: string | null,
  message: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const sessionId = await getSessionId();

    if (!recipientName.trim()) {
      return { success: false, error: "Recipient name is required" };
    }

    if (!message.trim()) {
      return { success: false, error: "Message is required" };
    }

    if (message.length < 10) {
      return { success: false, error: "Message must be at least 10 characters" };
    }

    if (message.length > 1000) {
      return { success: false, error: "Message must be less than 1000 characters" };
    }

    const compliment = await prisma.secretCompliment.create({
      data: {
        recipientName: recipientName.trim(),
        recipientHint: recipientHint?.trim() || null,
        message: message.trim(),
        sessionId,
        status: "PENDING",
      },
    });

    return { success: true, data: { id: compliment.id } };
  } catch (error) {
    console.error("createCompliment error:", error);
    return { success: false, error: "Failed to send compliment" };
  }
}

export async function reactToCompliment(
  complimentId: string,
  emoji: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    const sessionId = await getSessionId();

    const compliment = await prisma.secretCompliment.findUnique({
      where: { id: complimentId },
    });

    if (!compliment) {
      return { success: false, error: "Compliment not found" };
    }

    if (compliment.status !== "APPROVED") {
      return { success: false, error: "Compliment not available" };
    }

    const existingReaction = await prisma.complimentReaction.findUnique({
      where: {
        complimentId_sessionId_emoji: {
          complimentId,
          sessionId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await prisma.complimentReaction.delete({
        where: { id: existingReaction.id },
      });
      return { success: true, data: { added: false } };
    }

    await prisma.complimentReaction.create({
      data: {
        complimentId,
        sessionId,
        emoji,
      },
    });

    return { success: true, data: { added: true } };
  } catch (error) {
    console.error("reactToCompliment error:", error);
    return { success: false, error: "Failed to react" };
  }
}

export async function searchCompliments(query: string): Promise<
  ActionResult<{
    compliments: Array<{
      id: string;
      recipientName: string;
      recipientHint: string | null;
      message: string;
      complimentNumber: number | null;
      createdAt: Date;
      reactionCounts: Record<string, number>;
      totalReactions: number;
    }>;
  }>
> {
  try {
    if (!query.trim()) {
      return { success: true, data: { compliments: [] } };
    }

    // SQLite doesn't support mode: "insensitive", use contains (SQLite LIKE is case-insensitive by default)
    const compliments = await prisma.secretCompliment.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { recipientName: { contains: query.trim() } },
          { recipientHint: { contains: query.trim() } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reactions: true,
      },
    });

    const formattedCompliments = compliments.map((compliment) => {
      const reactionCounts: Record<string, number> = {};
      compliment.reactions.forEach((r) => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
      });

      return {
        id: compliment.id,
        recipientName: compliment.recipientName,
        recipientHint: compliment.recipientHint,
        message: compliment.message,
        complimentNumber: compliment.complimentNumber,
        createdAt: compliment.createdAt,
        reactionCounts,
        totalReactions: compliment.reactions.length,
      };
    });

    return { success: true, data: { compliments: formattedCompliments } };
  } catch (error) {
    console.error("searchCompliments error:", error);
    return { success: false, error: "Failed to search compliments" };
  }
}

export async function getUserReactions(
  complimentId: string
): Promise<ActionResult<{ reactions: string[] }>> {
  try {
    const sessionId = await getSessionId();

    const reactions = await prisma.complimentReaction.findMany({
      where: {
        complimentId,
        sessionId,
      },
      select: { emoji: true },
    });

    return {
      success: true,
      data: { reactions: reactions.map((r) => r.emoji) },
    };
  } catch (error) {
    console.error("getUserReactions error:", error);
    return { success: false, error: "Failed to get reactions" };
  }
}
