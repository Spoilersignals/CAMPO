"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

type ContentType = "confession" | "crush" | "spotted" | "poll";

type CommentData = {
  id: string;
  content: string;
  authorName: string | null;
  sessionId: string;
  parentId: string | null;
  isDeleted: boolean;
  createdAt: Date;
  replies?: CommentData[];
  reactionCounts?: Array<{ emoji: string; count: number }>;
};

const CONTENT_PATH_MAP: Record<ContentType, string> = {
  confession: "/confessions",
  crush: "/crushes",
  spotted: "/spotted",
  poll: "/polls",
};

export async function addComment(
  contentType: ContentType,
  contentId: string,
  content: string,
  authorName?: string,
  parentId?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!contentId) {
      return { success: false, error: "Content ID is required" };
    }

    if (!content || content.trim().length < 1) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (content.length > 500) {
      return { success: false, error: "Comment must be less than 500 characters" };
    }

    const sessionId = await getSessionId();
    let comment: { id: string };

    switch (contentType) {
      case "confession": {
        const confession = await prisma.confession.findUnique({
          where: { id: contentId, status: "APPROVED" },
        });
        if (!confession) {
          return { success: false, error: "Confession not found" };
        }
        comment = await prisma.confessionComment.create({
          data: {
            content: content.trim(),
            authorName: authorName?.trim() || null,
            confessionId: contentId,
          },
        });
        break;
      }
      case "crush": {
        const crush = await prisma.campusCrush.findUnique({
          where: { id: contentId, status: "APPROVED" },
        });
        if (!crush) {
          return { success: false, error: "Crush not found" };
        }
        comment = await prisma.crushComment.create({
          data: {
            content: content.trim(),
            authorName: authorName?.trim() || null,
            crushId: contentId,
          },
        });
        break;
      }
      case "spotted": {
        const spotted = await prisma.spotted.findUnique({
          where: { id: contentId, status: "APPROVED" },
        });
        if (!spotted) {
          return { success: false, error: "Spotted not found" };
        }
        comment = await prisma.spottedComment.create({
          data: {
            content: content.trim(),
            authorName: authorName?.trim() || null,
            spottedId: contentId,
          },
        });
        break;
      }
      case "poll": {
        const poll = await prisma.poll.findUnique({
          where: { id: contentId, status: "ACTIVE" },
        });
        if (!poll) {
          return { success: false, error: "Poll not found" };
        }
        comment = await prisma.pollComment.create({
          data: {
            content: content.trim(),
            authorName: authorName?.trim() || null,
            pollId: contentId,
          },
        });
        break;
      }
      default:
        return { success: false, error: "Invalid content type" };
    }

    revalidatePath(`${CONTENT_PATH_MAP[contentType]}/${contentId}`);

    return { success: true, data: { id: comment.id } };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getComments(
  contentType: ContentType,
  contentId: string
): Promise<
  ActionResult<{
    comments: Array<{
      id: string;
      content: string;
      authorName: string | null;
      createdAt: Date;
    }>;
  }>
> {
  try {
    if (!contentId) {
      return { success: false, error: "Content ID is required" };
    }

    let comments: Array<{
      id: string;
      content: string;
      authorName: string | null;
      createdAt: Date;
    }>;

    switch (contentType) {
      case "confession":
        comments = await prisma.confessionComment.findMany({
          where: { confessionId: contentId },
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        });
        break;
      case "crush":
        comments = await prisma.crushComment.findMany({
          where: { crushId: contentId },
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        });
        break;
      case "spotted":
        comments = await prisma.spottedComment.findMany({
          where: { spottedId: contentId },
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        });
        break;
      case "poll":
        comments = await prisma.pollComment.findMany({
          where: { pollId: contentId },
          select: {
            id: true,
            content: true,
            authorName: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        });
        break;
      default:
        return { success: false, error: "Invalid content type" };
    }

    return { success: true, data: { comments } };
  } catch (error) {
    console.error("Failed to get comments:", error);
    return { success: false, error: "Failed to get comments" };
  }
}

export async function toggleCommentReaction(
  commentId: string,
  emoji: string,
  contentType: ContentType
): Promise<ActionResult<{ added: boolean; count: number }>> {
  try {
    if (!commentId) {
      return { success: false, error: "Comment ID is required" };
    }

    if (!emoji) {
      return { success: false, error: "Emoji is required" };
    }

    const sessionId = await getSessionId();

    // Note: Current schema doesn't have comment-level reactions
    // This is a placeholder for when CommentReaction model is added
    // For now, return a not implemented error
    return { success: false, error: "Comment reactions not yet implemented" };
  } catch (error) {
    console.error("Failed to toggle comment reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

export async function deleteComment(
  commentId: string,
  contentType: ContentType
): Promise<ActionResult> {
  try {
    if (!commentId) {
      return { success: false, error: "Comment ID is required" };
    }

    const sessionId = await getSessionId();

    // Note: Current schema doesn't have sessionId or isDeleted on comment models
    // This is a placeholder for when those fields are added
    // For now, return a not implemented error
    return { success: false, error: "Comment deletion not yet implemented" };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

export async function getCommentReactions(
  commentId: string
): Promise<
  ActionResult<{
    reactions: Array<{ emoji: string; count: number }>;
    userReactions: string[];
  }>
> {
  try {
    if (!commentId) {
      return { success: false, error: "Comment ID is required" };
    }

    // Note: Current schema doesn't have comment-level reactions
    // This is a placeholder for when CommentReaction model is added
    return {
      success: true,
      data: {
        reactions: [],
        userReactions: [],
      },
    };
  } catch (error) {
    console.error("Failed to get comment reactions:", error);
    return { success: false, error: "Failed to get reactions" };
  }
}
