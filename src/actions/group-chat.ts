"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { containsBannedWords, getBannedWordsFound, DEFAULT_BANNED_WORDS } from "@/lib/banned-words";
import { auth } from "@/lib/auth";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

function generateAnonymousId(sessionId: string): string {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const num = Math.abs(hash) % 10000;
  return `Anon#${num.toString().padStart(4, "0")}`;
}

export async function sendGroupMessage(
  content: string,
  authorName?: string,
  replyToId?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!content || content.trim().length === 0) {
      return { success: false, error: "Message content is required" };
    }

    const sessionId = await getSessionId();
    const anonymousId = generateAnonymousId(sessionId);

    const dbBannedWords = await prisma.bannedWord.findMany();
    const allBannedWords = [
      ...DEFAULT_BANNED_WORDS,
      ...dbBannedWords.map((w) => w.word),
    ];

    if (containsBannedWords(content, allBannedWords)) {
      const foundWords = getBannedWordsFound(content, allBannedWords);
      return {
        success: false,
        error: `Message contains prohibited words: ${foundWords.join(", ")}. Selling is not allowed in group chat.`,
      };
    }

    const message = await prisma.groupChatMessage.create({
      data: {
        content: content.trim(),
        authorName: authorName?.trim() || null,
        sessionId,
        anonymousId,
        replyToId: replyToId || null,
      },
    });

    return { success: true, data: { id: message.id } };
  } catch (error) {
    console.error("Failed to send group message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getGroupMessages(
  limit: number = 50,
  before?: Date
): Promise<
  ActionResult<{
    messages: Array<{
      id: string;
      content: string;
      authorName: string | null;
      anonymousId: string;
      createdAt: Date;
      isOwn: boolean;
      replyTo: {
        id: string;
        content: string;
        anonymousId: string;
      } | null;
    }>;
  }>
> {
  try {
    const sessionId = await getSessionId();

    const messages = await prisma.groupChatMessage.findMany({
      where: {
        isDeleted: false,
        ...(before ? { createdAt: { lt: before } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        content: true,
        authorName: true,
        anonymousId: true,
        sessionId: true,
        createdAt: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            anonymousId: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        messages: messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          authorName: msg.authorName,
          anonymousId: msg.anonymousId,
          createdAt: msg.createdAt,
          isOwn: msg.sessionId === sessionId,
          replyTo: msg.replyTo
            ? {
                id: msg.replyTo.id,
                content: msg.replyTo.content.substring(0, 100),
                anonymousId: msg.replyTo.anonymousId,
              }
            : null,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get group messages:", error);
    return { success: false, error: "Failed to get messages" };
  }
}

export async function deleteMyMessage(
  messageId: string
): Promise<ActionResult> {
  try {
    const sessionId = await getSessionId();

    const message = await prisma.groupChatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    if (message.sessionId !== sessionId) {
      return { success: false, error: "You can only delete your own messages" };
    }

    if (message.isDeleted) {
      return { success: false, error: "Message is already deleted" };
    }

    await prisma.groupChatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: "OWNER",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

export async function adminDeleteMessage(
  messageId: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    const message = await prisma.groupChatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    if (message.isDeleted) {
      return { success: false, error: "Message is already deleted" };
    }

    await prisma.groupChatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: "ADMIN",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

export async function getBannedWords(): Promise<
  ActionResult<{
    words: Array<{ id: string; word: string; isDefault: boolean }>;
  }>
> {
  try {
    const dbBannedWords = await prisma.bannedWord.findMany({
      orderBy: { createdAt: "desc" },
    });

    const words = [
      ...dbBannedWords.map((w) => ({
        id: w.id,
        word: w.word,
        isDefault: false,
      })),
      ...DEFAULT_BANNED_WORDS.map((word, index) => ({
        id: `default-${index}`,
        word,
        isDefault: true,
      })),
    ];

    return { success: true, data: { words } };
  } catch (error) {
    console.error("Failed to get banned words:", error);
    return { success: false, error: "Failed to get banned words" };
  }
}

export async function addBannedWord(
  word: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    if (!word || word.trim().length === 0) {
      return { success: false, error: "Word is required" };
    }

    const trimmedWord = word.trim().toLowerCase();

    const existing = await prisma.bannedWord.findUnique({
      where: { word: trimmedWord },
    });

    if (existing) {
      return { success: false, error: "Word is already banned" };
    }

    const bannedWord = await prisma.bannedWord.create({
      data: { word: trimmedWord },
    });

    return { success: true, data: { id: bannedWord.id } };
  } catch (error) {
    console.error("Failed to add banned word:", error);
    return { success: false, error: "Failed to add banned word" };
  }
}

export async function removeBannedWord(id: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    const bannedWord = await prisma.bannedWord.findUnique({
      where: { id },
    });

    if (!bannedWord) {
      return { success: false, error: "Banned word not found" };
    }

    await prisma.bannedWord.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove banned word:", error);
    return { success: false, error: "Failed to remove banned word" };
  }
}
