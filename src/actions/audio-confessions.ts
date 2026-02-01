"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getAudioConfessions(
  page: number = 1,
  limit: number = 20
): Promise<
  ActionResult<{
    audioConfessions: Array<{
      id: string;
      audioUrl: string;
      duration: number;
      audioNumber: number | null;
      playCount: number;
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

    const [audioConfessionsRaw, total] = await Promise.all([
      prisma.audioConfession.findMany({
        where: { status: "APPROVED" },
        select: {
          id: true,
          audioUrl: true,
          duration: true,
          audioNumber: true,
          playCount: true,
          createdAt: true,
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.audioConfession.count({ where: { status: "APPROVED" } }),
    ]);

    const audioIds = audioConfessionsRaw.map((a) => a.id);
    const reactionGroups = await prisma.audioReaction.groupBy({
      by: ["audioId", "emoji"],
      where: { audioId: { in: audioIds } },
      _count: { emoji: true },
    });

    const reactionsByAudio = new Map<string, Array<{ emoji: string; count: number }>>();
    for (const r of reactionGroups) {
      if (!reactionsByAudio.has(r.audioId)) {
        reactionsByAudio.set(r.audioId, []);
      }
      reactionsByAudio.get(r.audioId)!.push({
        emoji: r.emoji,
        count: r._count.emoji,
      });
    }

    const audioConfessions = audioConfessionsRaw.map((a) => ({
      ...a,
      reactionBreakdown: reactionsByAudio.get(a.id) || [],
    }));

    return {
      success: true,
      data: {
        audioConfessions,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get audio confessions:", error);
    return { success: false, error: "Failed to get audio confessions" };
  }
}

export async function getAudioConfessionById(
  id: string
): Promise<
  ActionResult<{
    id: string;
    audioUrl: string;
    duration: number;
    audioNumber: number | null;
    playCount: number;
    createdAt: Date;
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
    }>;
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  } | null>
> {
  try {
    if (!id) {
      return { success: false, error: "Audio ID is required" };
    }

    const sessionId = await getSessionId();

    const audio = await prisma.audioConfession.findUnique({
      where: { id, status: "APPROVED" },
      select: {
        id: true,
        audioUrl: true,
        duration: true,
        audioNumber: true,
        playCount: true,
        createdAt: true,
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!audio) {
      return { success: true, data: null };
    }

    const [reactionGroups, userReactions] = await Promise.all([
      prisma.audioReaction.groupBy({
        by: ["emoji"],
        where: { audioId: id },
        _count: { emoji: true },
      }),
      prisma.audioReaction.findMany({
        where: { audioId: id, sessionId },
        select: { emoji: true },
      }),
    ]);

    return {
      success: true,
      data: {
        ...audio,
        reactions: reactionGroups.map((r) => ({
          emoji: r.emoji,
          count: r._count.emoji,
        })),
        userReactions: userReactions.map((r) => r.emoji),
      },
    };
  } catch (error) {
    console.error("Failed to get audio confession:", error);
    return { success: false, error: "Failed to get audio confession" };
  }
}

export async function createAudioConfession(
  audioUrl: string,
  duration: number
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!audioUrl) {
      return { success: false, error: "Audio is required" };
    }

    if (duration < 1) {
      return { success: false, error: "Audio must be at least 1 second" };
    }

    if (duration > 60) {
      return { success: false, error: "Audio must be less than 60 seconds" };
    }

    const sessionId = await getSessionId();

    const audio = await prisma.audioConfession.create({
      data: {
        audioUrl,
        duration,
        sessionId,
        status: "PENDING",
      },
    });

    return { success: true, data: { id: audio.id } };
  } catch (error) {
    console.error("Failed to create audio confession:", error);
    return { success: false, error: "Failed to submit audio confession" };
  }
}

export async function reactToAudio(
  audioId: string,
  emoji: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    if (!audioId) {
      return { success: false, error: "Audio ID is required" };
    }

    if (!emoji) {
      return { success: false, error: "Emoji is required" };
    }

    const sessionId = await getSessionId();

    const audio = await prisma.audioConfession.findUnique({
      where: { id: audioId, status: "APPROVED" },
    });

    if (!audio) {
      return { success: false, error: "Audio confession not found" };
    }

    const existingReaction = await prisma.audioReaction.findUnique({
      where: {
        audioId_sessionId_emoji: {
          audioId,
          sessionId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await prisma.audioReaction.delete({
        where: { id: existingReaction.id },
      });
      revalidatePath(`/audio/${audioId}`);
      revalidatePath("/audio");
      return { success: true, data: { added: false } };
    }

    await prisma.audioReaction.create({
      data: {
        audioId,
        sessionId,
        emoji,
      },
    });

    revalidatePath(`/audio/${audioId}`);
    revalidatePath("/audio");
    return { success: true, data: { added: true } };
  } catch (error) {
    console.error("Failed to react to audio:", error);
    return { success: false, error: "Failed to react" };
  }
}

export async function commentOnAudio(
  audioId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!audioId) {
      return { success: false, error: "Audio ID is required" };
    }

    if (!content || content.trim().length < 1) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (content.length > 500) {
      return { success: false, error: "Comment must be less than 500 characters" };
    }

    const sessionId = await getSessionId();

    const audio = await prisma.audioConfession.findUnique({
      where: { id: audioId, status: "APPROVED" },
    });

    if (!audio) {
      return { success: false, error: "Audio confession not found" };
    }

    const comment = await prisma.audioComment.create({
      data: {
        audioId,
        content: content.trim(),
        sessionId,
      },
    });

    revalidatePath(`/audio/${audioId}`);
    return { success: true, data: { id: comment.id } };
  } catch (error) {
    console.error("Failed to comment on audio:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function incrementPlayCount(
  audioId: string
): Promise<ActionResult> {
  try {
    if (!audioId) {
      return { success: false, error: "Audio ID is required" };
    }

    await prisma.audioConfession.update({
      where: { id: audioId },
      data: {
        playCount: { increment: 1 },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to increment play count:", error);
    return { success: false, error: "Failed to track play" };
  }
}

export async function getAudioReactions(
  audioId: string
): Promise<
  ActionResult<{
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  }>
> {
  try {
    if (!audioId) {
      return { success: false, error: "Audio ID is required" };
    }

    const sessionId = await getSessionId();

    const [reactions, userReactions] = await Promise.all([
      prisma.audioReaction.groupBy({
        by: ["emoji"],
        where: { audioId },
        _count: { emoji: true },
      }),
      prisma.audioReaction.findMany({
        where: { audioId, sessionId },
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
