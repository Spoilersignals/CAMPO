"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

const STORY_DURATION_HOURS = 24;

export async function getStories(): Promise<
  ActionResult<{
    stories: Array<{
      id: string;
      content: string | null;
      mediaUrl: string | null;
      mediaType: string | null;
      sessionId: string;
      viewCount: number;
      expiresAt: Date;
      createdAt: Date;
      timeLeft: number;
      reactionCount: number;
    }>;
  }>
> {
  try {
    const now = new Date();

    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        sessionId: true,
        viewCount: true,
        expiresAt: true,
        createdAt: true,
        _count: {
          select: { reactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: {
        stories: stories.map((s) => ({
          id: s.id,
          content: s.content,
          mediaUrl: s.mediaUrl,
          mediaType: s.mediaType,
          sessionId: s.sessionId,
          viewCount: s.viewCount,
          expiresAt: s.expiresAt,
          createdAt: s.createdAt,
          timeLeft: Math.max(0, s.expiresAt.getTime() - now.getTime()),
          reactionCount: s._count.reactions,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get stories:", error);
    return { success: false, error: "Failed to get stories" };
  }
}

export async function createStory(
  content?: string,
  mediaUrl?: string,
  mediaType?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!content?.trim() && !mediaUrl) {
      return { success: false, error: "Story must have content or media" };
    }

    const sessionId = await getSessionId();
    const expiresAt = new Date(Date.now() + STORY_DURATION_HOURS * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        content: content?.trim() || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        sessionId,
        expiresAt,
      },
    });

    revalidatePath("/stories");
    return { success: true, data: { id: story.id } };
  } catch (error) {
    console.error("Failed to create story:", error);
    return { success: false, error: "Failed to create story" };
  }
}

export async function viewStory(storyId: string): Promise<ActionResult> {
  try {
    if (!storyId) {
      return { success: false, error: "Story ID is required" };
    }

    const sessionId = await getSessionId();

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { sessionId: true, expiresAt: true },
    });

    if (!story) {
      return { success: false, error: "Story not found" };
    }

    if (story.expiresAt < new Date()) {
      return { success: false, error: "Story has expired" };
    }

    if (story.sessionId === sessionId) {
      return { success: true };
    }

    const existingView = await prisma.storyView.findUnique({
      where: {
        storyId_sessionId: { storyId, sessionId },
      },
    });

    if (!existingView) {
      await prisma.$transaction([
        prisma.storyView.create({
          data: { storyId, sessionId },
        }),
        prisma.story.update({
          where: { id: storyId },
          data: { viewCount: { increment: 1 } },
        }),
      ]);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to record view:", error);
    return { success: false, error: "Failed to record view" };
  }
}

export async function reactToStory(
  storyId: string,
  emoji: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    if (!storyId) {
      return { success: false, error: "Story ID is required" };
    }

    if (!emoji) {
      return { success: false, error: "Emoji is required" };
    }

    const sessionId = await getSessionId();

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { expiresAt: true },
    });

    if (!story) {
      return { success: false, error: "Story not found" };
    }

    if (story.expiresAt < new Date()) {
      return { success: false, error: "Story has expired" };
    }

    const existing = await prisma.storyReaction.findUnique({
      where: {
        storyId_sessionId_emoji: { storyId, sessionId, emoji },
      },
    });

    if (existing) {
      await prisma.storyReaction.delete({
        where: { id: existing.id },
      });
      return { success: true, data: { added: false } };
    }

    await prisma.storyReaction.create({
      data: { storyId, sessionId, emoji },
    });

    return { success: true, data: { added: true } };
  } catch (error) {
    console.error("Failed to react to story:", error);
    return { success: false, error: "Failed to react to story" };
  }
}

export async function getMyStories(): Promise<
  ActionResult<{
    stories: Array<{
      id: string;
      content: string | null;
      mediaUrl: string | null;
      mediaType: string | null;
      viewCount: number;
      expiresAt: Date;
      createdAt: Date;
      timeLeft: number;
      reactionCount: number;
      views: Array<{ sessionId: string; createdAt: Date }>;
    }>;
  }>
> {
  try {
    const sessionId = await getSessionId();
    const now = new Date();

    const stories = await prisma.story.findMany({
      where: {
        sessionId,
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        viewCount: true,
        expiresAt: true,
        createdAt: true,
        _count: {
          select: { reactions: true },
        },
        views: {
          select: { sessionId: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: {
        stories: stories.map((s) => ({
          id: s.id,
          content: s.content,
          mediaUrl: s.mediaUrl,
          mediaType: s.mediaType,
          viewCount: s.viewCount,
          expiresAt: s.expiresAt,
          createdAt: s.createdAt,
          timeLeft: Math.max(0, s.expiresAt.getTime() - now.getTime()),
          reactionCount: s._count.reactions,
          views: s.views,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get my stories:", error);
    return { success: false, error: "Failed to get stories" };
  }
}

export async function deleteStory(storyId: string): Promise<ActionResult> {
  try {
    if (!storyId) {
      return { success: false, error: "Story ID is required" };
    }

    const sessionId = await getSessionId();

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { sessionId: true },
    });

    if (!story) {
      return { success: false, error: "Story not found" };
    }

    if (story.sessionId !== sessionId) {
      return { success: false, error: "Not authorized to delete this story" };
    }

    await prisma.story.delete({
      where: { id: storyId },
    });

    revalidatePath("/stories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete story:", error);
    return { success: false, error: "Failed to delete story" };
  }
}

export async function getStoryReactions(
  storyId: string
): Promise<
  ActionResult<{
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  }>
> {
  try {
    if (!storyId) {
      return { success: false, error: "Story ID is required" };
    }

    const sessionId = await getSessionId();

    const [reactions, userReactions] = await Promise.all([
      prisma.storyReaction.groupBy({
        by: ["emoji"],
        where: { storyId },
        _count: { emoji: true },
      }),
      prisma.storyReaction.findMany({
        where: { storyId, sessionId },
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
