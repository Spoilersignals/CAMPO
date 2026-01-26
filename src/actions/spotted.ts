"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { notifyAdminsOfPendingSpotted } from "@/lib/notifications";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function submitSpotted(data: {
  content: string;
  location: string;
  spottedAt?: Date;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const spotted = await prisma.spotted.create({
      data: {
        content: data.content,
        location: data.location,
        spottedAt: data.spottedAt ?? new Date(),
        status: "PENDING",
      },
    });

    await notifyAdminsOfPendingSpotted();

    return { success: true, data: { id: spotted.id } };
  } catch (error) {
    console.error("Failed to submit spotted:", error);
    return { success: false, error: "Failed to submit spotted" };
  }
}

export async function getApprovedSpotted(
  page: number,
  limit: number,
  sortBy: "hot" | "recent" = "recent"
): Promise<
  ActionResult<{
    items: Array<{
      id: string;
      content: string;
      location: string;
      spottedAt: Date | null;
      spottedNumber: number | null;
      createdAt: Date;
      _count: { comments: number; reactions: number };
      reactions: Array<{ emoji: string; _count: number }>;
      reactionBreakdown: Array<{ emoji: string; count: number }>;
    }>;
    total: number;
    totalPages: number;
  }>
> {
  try {
    const skip = (page - 1) * limit;

    const orderBy =
      sortBy === "hot"
        ? [{ reactions: { _count: "desc" as const } }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

    const [items, total] = await Promise.all([
      prisma.spotted.findMany({
        where: { status: "APPROVED" },
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { comments: true, reactions: true } },
          reactions: true,
        },
      }),
      prisma.spotted.count({ where: { status: "APPROVED" } }),
    ]);

    const itemsWithGroupedReactions = items.map((item) => {
      const reactionCounts = item.reactions.reduce(
        (acc, reaction) => {
          acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const reactionBreakdown = Object.entries(reactionCounts).map(([emoji, count]) => ({
        emoji,
        count,
      }));

      return {
        ...item,
        reactions: Object.entries(reactionCounts).map(([emoji, count]) => ({
          emoji,
          _count: count,
        })),
        reactionBreakdown,
      };
    });

    return {
      success: true,
      data: {
        items: itemsWithGroupedReactions,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get approved spotted:", error);
    return { success: false, error: "Failed to get spotted posts" };
  }
}

export async function getSpottedById(id: string): Promise<
  ActionResult<{
    id: string;
    content: string;
    location: string;
    spottedAt: Date | null;
    spottedNumber: number | null;
    status: string;
    createdAt: Date;
    comments: Array<{
      id: string;
      content: string;
      authorName: string | null;
      createdAt: Date;
    }>;
    reactions: Array<{ emoji: string; _count: number }>;
  }>
> {
  try {
    const spotted = await prisma.spotted.findUnique({
      where: { id },
      include: {
        comments: { orderBy: { createdAt: "asc" } },
        reactions: true,
      },
    });

    if (!spotted) {
      return { success: false, error: "Spotted not found" };
    }

    const reactionCounts = spotted.reactions.reduce(
      (acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      success: true,
      data: {
        ...spotted,
        reactions: Object.entries(reactionCounts).map(([emoji, count]) => ({
          emoji,
          _count: count,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get spotted:", error);
    return { success: false, error: "Failed to get spotted" };
  }
}

export async function addSpottedComment(
  spottedId: string,
  content: string,
  authorName?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const spotted = await prisma.spotted.findUnique({
      where: { id: spottedId },
    });

    if (!spotted) {
      return { success: false, error: "Spotted not found" };
    }

    const comment = await prisma.spottedComment.create({
      data: {
        content,
        authorName: authorName || null,
        spottedId,
      },
    });

    return { success: true, data: { id: comment.id } };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function toggleSpottedReaction(
  spottedId: string,
  emoji: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    const sessionId = await getSessionId();

    const existingReaction = await prisma.spottedReaction.findUnique({
      where: {
        sessionId_spottedId_emoji: {
          sessionId,
          spottedId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await prisma.spottedReaction.delete({
        where: { id: existingReaction.id },
      });
      return { success: true, data: { added: false } };
    }

    await prisma.spottedReaction.create({
      data: {
        emoji,
        sessionId,
        spottedId,
      },
    });

    return { success: true, data: { added: true } };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

export async function getSpottedReactions(
  spottedId: string
): Promise<ActionResult<Array<{ emoji: string; count: number }>>> {
  try {
    const reactions = await prisma.spottedReaction.groupBy({
      by: ["emoji"],
      where: { spottedId },
      _count: { emoji: true },
    });

    return {
      success: true,
      data: reactions.map((r) => ({
        emoji: r.emoji,
        count: r._count.emoji,
      })),
    };
  } catch (error) {
    console.error("Failed to get reactions:", error);
    return { success: false, error: "Failed to get reactions" };
  }
}

export async function getSpottedReactionsWithUser(
  spottedId: string
): Promise<
  ActionResult<{
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  }>
> {
  try {
    const sessionId = await getSessionId();

    const [reactions, userReactions] = await Promise.all([
      prisma.spottedReaction.groupBy({
        by: ["emoji"],
        where: { spottedId },
        _count: { emoji: true },
      }),
      prisma.spottedReaction.findMany({
        where: { spottedId, sessionId },
        select: { emoji: true },
      }),
    ]);

    return {
      success: true,
      data: {
        reactions: reactions.map((r) => ({
          emoji: r.emoji,
          count: r._count.emoji,
        })),
        userReactions: userReactions.map((r) => r.emoji),
      },
    };
  } catch (error) {
    console.error("Failed to get reactions:", error);
    return { success: false, error: "Failed to get reactions" };
  }
}
