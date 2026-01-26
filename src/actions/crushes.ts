"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { notifyAdminsOfPendingCrush } from "@/lib/notifications";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function submitCrush(data: {
  title: string;
  description: string;
  location?: string;
  seenAt?: Date;
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.title || data.title.length < 3) {
      return { success: false, error: "Title must be at least 3 characters" };
    }

    if (!data.description || data.description.length < 10) {
      return { success: false, error: "Description must be at least 10 characters" };
    }

    const crush = await prisma.campusCrush.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location || null,
        seenAt: data.seenAt || null,
        status: "PENDING",
      },
    });

    await notifyAdminsOfPendingCrush();

    revalidatePath("/crushes");
    return { success: true, data: { id: crush.id } };
  } catch (error) {
    console.error("Failed to submit crush:", error);
    return { success: false, error: "Failed to submit crush" };
  }
}

export async function getApprovedCrushes(
  page: number = 1,
  limit: number = 10,
  sortBy: "hot" | "recent" = "recent"
): Promise<ActionResult<{
  crushes: Array<{
    id: string;
    title: string;
    description: string;
    location: string | null;
    seenAt: Date | null;
    crushNumber: number | null;
    createdAt: Date;
    approvedAt: Date | null;
    _count: { comments: number; reactions: number };
    reactions: Array<{ emoji: string; sessionId: string }>;
    reactionBreakdown: Array<{ emoji: string; count: number }>;
  }>;
  total: number;
  pages: number;
}>> {
  try {
    const skip = (page - 1) * limit;

    const orderBy =
      sortBy === "hot"
        ? [{ reactions: { _count: "desc" as const } }, { approvedAt: "desc" as const }]
        : [{ approvedAt: "desc" as const }];

    const [crushesRaw, total] = await Promise.all([
      prisma.campusCrush.findMany({
        where: { status: "APPROVED" },
        include: {
          reactions: {
            select: { emoji: true, sessionId: true },
          },
          _count: {
            select: { comments: true, reactions: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.campusCrush.count({ where: { status: "APPROVED" } }),
    ]);

    const crushIds = crushesRaw.map((c) => c.id);
    const reactionGroups = await prisma.crushReaction.groupBy({
      by: ["crushId", "emoji"],
      where: { crushId: { in: crushIds } },
      _count: { emoji: true },
    });

    const reactionsByCrush = new Map<string, Array<{ emoji: string; count: number }>>();
    for (const r of reactionGroups) {
      if (!reactionsByCrush.has(r.crushId)) {
        reactionsByCrush.set(r.crushId, []);
      }
      reactionsByCrush.get(r.crushId)!.push({
        emoji: r.emoji,
        count: r._count.emoji,
      });
    }

    const crushes = crushesRaw.map((c) => ({
      ...c,
      reactionBreakdown: reactionsByCrush.get(c.id) || [],
    }));

    return {
      success: true,
      data: {
        crushes,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get crushes:", error);
    return { success: false, error: "Failed to get crushes" };
  }
}

export async function getCrushById(id: string): Promise<ActionResult<{
  id: string;
  title: string;
  description: string;
  location: string | null;
  seenAt: Date | null;
  crushNumber: number | null;
  createdAt: Date;
  approvedAt: Date | null;
  comments: Array<{
    id: string;
    content: string;
    authorName: string | null;
    createdAt: Date;
  }>;
  reactions: Array<{ emoji: string; sessionId: string }>;
} | null>> {
  try {
    const crush = await prisma.campusCrush.findUnique({
      where: { id, status: "APPROVED" },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
        reactions: {
          select: { emoji: true, sessionId: true },
        },
      },
    });

    return { success: true, data: crush };
  } catch (error) {
    console.error("Failed to get crush:", error);
    return { success: false, error: "Failed to get crush" };
  }
}

export async function addCrushComment(
  crushId: string,
  content: string,
  authorName?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!content || content.length < 1) {
      return { success: false, error: "Comment cannot be empty" };
    }

    const crush = await prisma.campusCrush.findUnique({
      where: { id: crushId, status: "APPROVED" },
    });

    if (!crush) {
      return { success: false, error: "Crush not found" };
    }

    const comment = await prisma.crushComment.create({
      data: {
        content,
        authorName: authorName || null,
        crushId,
      },
    });

    revalidatePath(`/crushes/${crushId}`);
    return { success: true, data: { id: comment.id } };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function toggleCrushReaction(
  crushId: string,
  emoji: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    const sessionId = await getSessionId();

    const crush = await prisma.campusCrush.findUnique({
      where: { id: crushId, status: "APPROVED" },
    });

    if (!crush) {
      return { success: false, error: "Crush not found" };
    }

    const existingReaction = await prisma.crushReaction.findUnique({
      where: {
        sessionId_crushId_emoji: {
          sessionId,
          crushId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await prisma.crushReaction.delete({
        where: { id: existingReaction.id },
      });
      revalidatePath(`/crushes/${crushId}`);
      return { success: true, data: { added: false } };
    }

    await prisma.crushReaction.create({
      data: {
        emoji,
        sessionId,
        crushId,
      },
    });

    revalidatePath(`/crushes/${crushId}`);
    return { success: true, data: { added: true } };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

export async function getCrushReactions(
  crushId: string
): Promise<ActionResult<Record<string, number>>> {
  try {
    const reactions = await prisma.crushReaction.groupBy({
      by: ["emoji"],
      where: { crushId },
      _count: { emoji: true },
    });

    const reactionCounts: Record<string, number> = {};
    for (const r of reactions) {
      reactionCounts[r.emoji] = r._count.emoji;
    }

    return { success: true, data: reactionCounts };
  } catch (error) {
    console.error("Failed to get reactions:", error);
    return { success: false, error: "Failed to get reactions" };
  }
}

export async function getCrushReactionsWithUser(
  crushId: string
): Promise<
  ActionResult<{
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  }>
> {
  try {
    const sessionId = await getSessionId();

    const [reactions, userReactions] = await Promise.all([
      prisma.crushReaction.groupBy({
        by: ["emoji"],
        where: { crushId },
        _count: { emoji: true },
      }),
      prisma.crushReaction.findMany({
        where: { crushId, sessionId },
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
