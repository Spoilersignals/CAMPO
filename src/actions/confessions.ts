"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { notifyAdminsOfPendingConfession } from "@/lib/notifications";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function submitConfession(
  content: string,
  options?: {
    mediaUrl?: string;
    mediaType?: "image" | "video";
    linkUrl?: string;
    linkTitle?: string;
    linkImage?: string;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!content || content.trim().length < 10) {
      return { success: false, error: "Confession must be at least 10 characters" };
    }

    if (content.length > 2000) {
      return { success: false, error: "Confession must be less than 2000 characters" };
    }

    const confession = await prisma.confession.create({
      data: {
        content: content.trim(),
        status: "PENDING",
        mediaUrl: options?.mediaUrl,
        mediaType: options?.mediaType,
        linkUrl: options?.linkUrl,
        linkTitle: options?.linkTitle,
        linkImage: options?.linkImage,
      },
    });

    await notifyAdminsOfPendingConfession();

    return { success: true, data: { id: confession.id } };
  } catch (error) {
    console.error("Failed to submit confession:", error);
    return { success: false, error: "Failed to submit confession" };
  }
}

export async function getApprovedConfessions(
  page: number = 1,
  limit: number = 10,
  sortBy: "recent" | "hot" = "recent"
): Promise<
  ActionResult<{
    confessions: Array<{
      id: string;
      content: string;
      confessionNumber: number | null;
      shareCode: string | null;
      createdAt: Date;
      approvedAt: Date | null;
      _count: { comments: number; reactions: number };
      reactionBreakdown: Array<{ emoji: string; count: number }>;
    }>;
    total: number;
    pages: number;
  }>
> {
  try {
    const skip = (page - 1) * limit;

    const orderBy =
      sortBy === "hot"
        ? [{ reactions: { _count: "desc" as const } }, { approvedAt: "desc" as const }]
        : [{ approvedAt: "desc" as const }];

    const [confessionsRaw, total] = await Promise.all([
      prisma.confession.findMany({
        where: { status: "APPROVED" },
        select: {
          id: true,
          content: true,
          confessionNumber: true,
          shareCode: true,
          createdAt: true,
          approvedAt: true,
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.confession.count({ where: { status: "APPROVED" } }),
    ]);

    const confessionIds = confessionsRaw.map((c) => c.id);
    const reactionGroups = await prisma.confessionReaction.groupBy({
      by: ["confessionId", "emoji"],
      where: { confessionId: { in: confessionIds } },
      _count: { emoji: true },
    });

    const reactionsByConfession = new Map<string, Array<{ emoji: string; count: number }>>();
    for (const r of reactionGroups) {
      if (!reactionsByConfession.has(r.confessionId)) {
        reactionsByConfession.set(r.confessionId, []);
      }
      reactionsByConfession.get(r.confessionId)!.push({
        emoji: r.emoji,
        count: r._count.emoji,
      });
    }

    const confessions = confessionsRaw.map((c) => ({
      ...c,
      reactionBreakdown: reactionsByConfession.get(c.id) || [],
    }));

    return {
      success: true,
      data: {
        confessions,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get confessions:", error);
    return { success: false, error: "Failed to get confessions" };
  }
}

export async function getConfessionById(
  id: string
): Promise<
  ActionResult<{
    id: string;
    content: string;
    confessionNumber: number | null;
    shareCode: string | null;
    createdAt: Date;
    approvedAt: Date | null;
    mediaUrl: string | null;
    mediaType: string | null;
    linkUrl: string | null;
    linkTitle: string | null;
    linkImage: string | null;
    comments: Array<{
      id: string;
      content: string;
      authorName: string | null;
      createdAt: Date;
    }>;
    _count: { reactions: number };
  } | null>
> {
  try {
    if (!id) {
      return { success: false, error: "Confession ID is required" };
    }

    const confession = await prisma.confession.findUnique({
      where: { id, status: "APPROVED" },
      select: {
        id: true,
        content: true,
        confessionNumber: true,
        shareCode: true,
        createdAt: true,
        approvedAt: true,
        mediaUrl: true,
        mediaType: true,
        linkUrl: true,
        linkTitle: true,
        linkImage: true,
        comments: {
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { reactions: true },
        },
      },
    });

    return { success: true, data: confession };
  } catch (error) {
    console.error("Failed to get confession:", error);
    return { success: false, error: "Failed to get confession" };
  }
}

export async function addConfessionComment(
  confessionId: string,
  content: string,
  authorName?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!confessionId) {
      return { success: false, error: "Confession ID is required" };
    }

    if (!content || content.trim().length < 1) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (content.length > 500) {
      return { success: false, error: "Comment must be less than 500 characters" };
    }

    const confession = await prisma.confession.findUnique({
      where: { id: confessionId, status: "APPROVED" },
    });

    if (!confession) {
      return { success: false, error: "Confession not found" };
    }

    const comment = await prisma.confessionComment.create({
      data: {
        content: content.trim(),
        authorName: authorName?.trim() || null,
        confessionId,
      },
    });

    revalidatePath(`/confessions/${confessionId}`);

    return { success: true, data: { id: comment.id } };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function toggleConfessionReaction(
  confessionId: string,
  emoji: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    if (!confessionId) {
      return { success: false, error: "Confession ID is required" };
    }

    if (!emoji) {
      return { success: false, error: "Emoji is required" };
    }

    const sessionId = await getSessionId();

    const confession = await prisma.confession.findUnique({
      where: { id: confessionId, status: "APPROVED" },
    });

    if (!confession) {
      return { success: false, error: "Confession not found" };
    }

    const existingReaction = await prisma.confessionReaction.findUnique({
      where: {
        sessionId_confessionId_emoji: {
          sessionId,
          confessionId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await prisma.confessionReaction.delete({
        where: { id: existingReaction.id },
      });

      revalidatePath(`/confessions/${confessionId}`);
      return { success: true, data: { added: false } };
    }

    await prisma.confessionReaction.create({
      data: {
        emoji,
        sessionId,
        confessionId,
      },
    });

    revalidatePath(`/confessions/${confessionId}`);
    return { success: true, data: { added: true } };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

export async function recordConfessionView(
  confessionId: string
): Promise<ActionResult> {
  try {
    if (!confessionId) {
      return { success: false, error: "Confession ID is required" };
    }

    const sessionId = await getSessionId();

    // Upsert to avoid duplicate views from same session
    await prisma.confessionView.upsert({
      where: {
        sessionId_confessionId: {
          sessionId,
          confessionId,
        },
      },
      create: {
        sessionId,
        confessionId,
      },
      update: {
        viewedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to record view:", error);
    return { success: false, error: "Failed to record view" };
  }
}

export async function getStoriesConfessions(
  limit: number = 20
): Promise<
  ActionResult<{
    confessions: Array<{
      id: string;
      content: string;
      confessionNumber: number | null;
      shareCode: string | null;
      createdAt: Date;
      approvedAt: Date | null;
      expiresAt: Date | null;
      _count: { comments: number; reactions: number; views: number };
      reactionBreakdown: Array<{ emoji: string; count: number }>;
    }>;
  }>
> {
  try {
    const now = new Date();
    
    const confessionsRaw = await prisma.confession.findMany({
      where: {
        status: "APPROVED",
        expiresAt: { gt: now }, // Only non-expired stories
      },
      select: {
        id: true,
        content: true,
        confessionNumber: true,
        shareCode: true,
        createdAt: true,
        approvedAt: true,
        expiresAt: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
            views: true,
          },
        },
      },
      orderBy: { approvedAt: "desc" },
      take: limit,
    });

    const confessionIds = confessionsRaw.map((c) => c.id);
    const reactionGroups = await prisma.confessionReaction.groupBy({
      by: ["confessionId", "emoji"],
      where: { confessionId: { in: confessionIds } },
      _count: { emoji: true },
    });

    const reactionsByConfession = new Map<string, Array<{ emoji: string; count: number }>>();
    for (const r of reactionGroups) {
      if (!reactionsByConfession.has(r.confessionId)) {
        reactionsByConfession.set(r.confessionId, []);
      }
      reactionsByConfession.get(r.confessionId)!.push({
        emoji: r.emoji,
        count: r._count.emoji,
      });
    }

    const confessions = confessionsRaw.map((c) => ({
      ...c,
      reactionBreakdown: reactionsByConfession.get(c.id) || [],
    }));

    return { success: true, data: { confessions } };
  } catch (error) {
    console.error("Failed to get stories:", error);
    return { success: false, error: "Failed to get stories" };
  }
}

export async function getConfessionReactions(
  confessionId: string
): Promise<
  ActionResult<{
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  }>
> {
  try {
    if (!confessionId) {
      return { success: false, error: "Confession ID is required" };
    }

    const sessionId = await getSessionId();

    const [reactions, userReactions] = await Promise.all([
      prisma.confessionReaction.groupBy({
        by: ["emoji"],
        where: { confessionId },
        _count: { emoji: true },
      }),
      prisma.confessionReaction.findMany({
        where: { confessionId, sessionId },
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

export async function getMyStories(): Promise<
  ActionResult<{
    stories: Array<{
      id: string;
      content: string;
      confessionNumber: number | null;
      shareCode: string | null;
      createdAt: Date;
      approvedAt: Date | null;
      expiresAt: Date | null;
      _count: { comments: number; reactions: number; views: number };
    }>;
  }>
> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const stories = await prisma.confession.findMany({
      where: {
        recipientId: session.user.id,
        status: "APPROVED",
      },
      select: {
        id: true,
        content: true,
        confessionNumber: true,
        shareCode: true,
        createdAt: true,
        approvedAt: true,
        expiresAt: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
            views: true,
          },
        },
      },
      orderBy: { approvedAt: "desc" },
    });

    return { success: true, data: { stories } };
  } catch (error) {
    console.error("Failed to get my stories:", error);
    return { success: false, error: "Failed to get stories" };
  }
}

export async function deleteMyStory(id: string): Promise<ActionResult> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const confession = await prisma.confession.findUnique({
      where: { id },
      select: { recipientId: true },
    });

    if (!confession) {
      return { success: false, error: "Story not found" };
    }

    if (confession.recipientId !== session.user.id) {
      return { success: false, error: "Not authorized to delete this story" };
    }

    await prisma.confession.delete({
      where: { id },
    });

    revalidatePath("/confessions/my-stories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete story:", error);
    return { success: false, error: "Failed to delete story" };
  }
}
