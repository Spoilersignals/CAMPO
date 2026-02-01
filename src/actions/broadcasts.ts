"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type BroadcastData = {
  id: string;
  title: string;
  content: string;
  priority: string;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  isRead: boolean;
};

/**
 * Get active broadcasts for a session
 */
export async function getActiveBroadcasts(
  sessionId: string
): Promise<{ success: boolean; broadcasts: BroadcastData[] }> {
  try {
    const broadcasts = await prisma.adminBroadcast.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        reads: {
          where: { sessionId },
        },
      },
    });

    return {
      success: true,
      broadcasts: broadcasts.map((b) => ({
        id: b.id,
        title: b.title,
        content: b.content,
        priority: b.priority,
        isActive: b.isActive,
        expiresAt: b.expiresAt,
        createdAt: b.createdAt,
        isRead: b.reads.length > 0,
      })),
    };
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    return { success: false, broadcasts: [] };
  }
}

/**
 * Get unread broadcasts count
 */
export async function getUnreadBroadcastCount(
  sessionId: string
): Promise<number> {
  try {
    const count = await prisma.adminBroadcast.count({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
        NOT: {
          reads: {
            some: { sessionId },
          },
        },
      },
    });
    return count;
  } catch {
    return 0;
  }
}

/**
 * Mark broadcast as read
 */
export async function markBroadcastRead(
  broadcastId: string,
  sessionId: string
): Promise<{ success: boolean }> {
  try {
    await prisma.broadcastRead.upsert({
      where: {
        broadcastId_sessionId: {
          broadcastId,
          sessionId,
        },
      },
      create: {
        broadcastId,
        sessionId,
      },
      update: {},
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking broadcast read:", error);
    return { success: false };
  }
}

/**
 * Create a new broadcast (admin only)
 */
export async function createBroadcast(
  title: string,
  content: string,
  priority: string = "NORMAL",
  expiresInHours?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Not authorized" };
    }

    const expiresAt = expiresInHours 
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      : null;

    await prisma.adminBroadcast.create({
      data: {
        title,
        content,
        priority,
        expiresAt,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating broadcast:", error);
    return { success: false, error: "Failed to create broadcast" };
  }
}

/**
 * Deactivate a broadcast (admin only)
 */
export async function deactivateBroadcast(
  broadcastId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Not authorized" };
    }

    await prisma.adminBroadcast.update({
      where: { id: broadcastId },
      data: { isActive: false },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deactivating broadcast:", error);
    return { success: false, error: "Failed to deactivate" };
  }
}
