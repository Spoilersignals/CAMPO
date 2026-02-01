"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getMemes(
  page: number = 1,
  limit: number = 20,
  sortBy: "hot" | "new" | "top" = "hot"
): Promise<
  ActionResult<{
    memes: Array<{
      id: string;
      title: string | null;
      imageUrl: string;
      caption: string | null;
      memeNumber: number | null;
      isFeatured: boolean;
      createdAt: Date;
      _count: { comments: number; reactions: number };
      reactionBreakdown: Array<{ emoji: string; count: number }>;
    }>;
    total: number;
    pages: number;
  }>
> {
  try {
    const skip = (page - 1) * limit;

    let orderBy;
    if (sortBy === "new") {
      orderBy = [{ createdAt: "desc" as const }];
    } else if (sortBy === "top") {
      orderBy = [{ reactions: { _count: "desc" as const } }, { createdAt: "desc" as const }];
    } else {
      orderBy = [{ reactions: { _count: "desc" as const } }, { createdAt: "desc" as const }];
    }

    const [memesRaw, total] = await Promise.all([
      prisma.meme.findMany({
        where: { status: "APPROVED" },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          caption: true,
          memeNumber: true,
          isFeatured: true,
          createdAt: true,
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
      prisma.meme.count({ where: { status: "APPROVED" } }),
    ]);

    const memeIds = memesRaw.map((m) => m.id);
    const reactionGroups = await prisma.memeReaction.groupBy({
      by: ["memeId", "emoji"],
      where: { memeId: { in: memeIds } },
      _count: { emoji: true },
    });

    const reactionsByMeme = new Map<string, Array<{ emoji: string; count: number }>>();
    for (const r of reactionGroups) {
      if (!reactionsByMeme.has(r.memeId)) {
        reactionsByMeme.set(r.memeId, []);
      }
      reactionsByMeme.get(r.memeId)!.push({
        emoji: r.emoji,
        count: r._count.emoji,
      });
    }

    const memes = memesRaw.map((m) => ({
      ...m,
      reactionBreakdown: reactionsByMeme.get(m.id) || [],
    }));

    return {
      success: true,
      data: {
        memes,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get memes:", error);
    return { success: false, error: "Failed to get memes" };
  }
}

export async function createMeme(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const imageUrl = formData.get("imageUrl") as string;
    const title = formData.get("title") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!imageUrl) {
      return { success: false, error: "Image is required" };
    }

    const sessionId = await getSessionId();

    const meme = await prisma.meme.create({
      data: {
        imageUrl,
        title: title?.trim() || null,
        caption: caption?.trim() || null,
        sessionId,
        status: "PENDING",
      },
    });

    return { success: true, data: { id: meme.id } };
  } catch (error) {
    console.error("Failed to create meme:", error);
    return { success: false, error: "Failed to create meme" };
  }
}

export async function reactToMeme(
  memeId: string,
  emoji: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    if (!memeId) {
      return { success: false, error: "Meme ID is required" };
    }

    const sessionId = await getSessionId();

    const existingReaction = await prisma.memeReaction.findUnique({
      where: {
        memeId_sessionId_emoji: {
          memeId,
          sessionId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await prisma.memeReaction.delete({
        where: { id: existingReaction.id },
      });
      revalidatePath(`/memes/${memeId}`);
      revalidatePath("/memes");
      return { success: true, data: { added: false } };
    }

    await prisma.memeReaction.create({
      data: {
        memeId,
        sessionId,
        emoji,
      },
    });

    revalidatePath(`/memes/${memeId}`);
    revalidatePath("/memes");
    return { success: true, data: { added: true } };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

export async function commentOnMeme(
  memeId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!memeId) {
      return { success: false, error: "Meme ID is required" };
    }

    if (!content || content.trim().length < 1) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (content.length > 500) {
      return { success: false, error: "Comment must be less than 500 characters" };
    }

    const meme = await prisma.meme.findUnique({
      where: { id: memeId, status: "APPROVED" },
    });

    if (!meme) {
      return { success: false, error: "Meme not found" };
    }

    const sessionId = await getSessionId();

    const comment = await prisma.memeComment.create({
      data: {
        content: content.trim(),
        memeId,
        sessionId,
      },
    });

    revalidatePath(`/memes/${memeId}`);
    return { success: true, data: { id: comment.id } };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getMemeOfTheWeek(): Promise<
  ActionResult<{
    meme: {
      id: string;
      title: string | null;
      imageUrl: string;
      caption: string | null;
      memeNumber: number | null;
      isFeatured: boolean;
      createdAt: Date;
      _count: { comments: number; reactions: number };
      reactionBreakdown: Array<{ emoji: string; count: number }>;
    } | null;
  }>
> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const featuredMeme = await prisma.meme.findFirst({
      where: {
        status: "APPROVED",
        isFeatured: true,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        caption: true,
        memeNumber: true,
        isFeatured: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (featuredMeme) {
      const reactionGroups = await prisma.memeReaction.groupBy({
        by: ["emoji"],
        where: { memeId: featuredMeme.id },
        _count: { emoji: true },
      });

      return {
        success: true,
        data: {
          meme: {
            ...featuredMeme,
            reactionBreakdown: reactionGroups.map((r) => ({
              emoji: r.emoji,
              count: r._count.emoji,
            })),
          },
        },
      };
    }

    const topMeme = await prisma.meme.findFirst({
      where: {
        status: "APPROVED",
        createdAt: { gte: oneWeekAgo },
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        caption: true,
        memeNumber: true,
        isFeatured: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: { reactions: { _count: "desc" } },
    });

    if (!topMeme) {
      return { success: true, data: { meme: null } };
    }

    const reactionGroups = await prisma.memeReaction.groupBy({
      by: ["emoji"],
      where: { memeId: topMeme.id },
      _count: { emoji: true },
    });

    return {
      success: true,
      data: {
        meme: {
          ...topMeme,
          reactionBreakdown: reactionGroups.map((r) => ({
            emoji: r.emoji,
            count: r._count.emoji,
          })),
        },
      },
    };
  } catch (error) {
    console.error("Failed to get meme of the week:", error);
    return { success: false, error: "Failed to get meme of the week" };
  }
}

export async function getMemeById(id: string): Promise<
  ActionResult<{
    meme: {
      id: string;
      title: string | null;
      imageUrl: string;
      caption: string | null;
      memeNumber: number | null;
      isFeatured: boolean;
      createdAt: Date;
      _count: { comments: number; reactions: number };
      comments: Array<{
        id: string;
        content: string;
        createdAt: Date;
      }>;
    } | null;
  }>
> {
  try {
    if (!id) {
      return { success: false, error: "Meme ID is required" };
    }

    const meme = await prisma.meme.findUnique({
      where: { id, status: "APPROVED" },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        caption: true,
        memeNumber: true,
        isFeatured: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, data: { meme } };
  } catch (error) {
    console.error("Failed to get meme:", error);
    return { success: false, error: "Failed to get meme" };
  }
}

export async function getMemeReactions(memeId: string): Promise<
  ActionResult<{
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  }>
> {
  try {
    if (!memeId) {
      return { success: false, error: "Meme ID is required" };
    }

    const sessionId = await getSessionId();

    const [reactions, userReactions] = await Promise.all([
      prisma.memeReaction.groupBy({
        by: ["emoji"],
        where: { memeId },
        _count: { emoji: true },
      }),
      prisma.memeReaction.findMany({
        where: { memeId, sessionId },
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
