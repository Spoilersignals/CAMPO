"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function getSessionId() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2);
  }
  return sessionId;
}

// Get who liked a confession (like Instagram)
export async function getConfessionLikes(confessionId: string, limit = 50) {
  try {
    // Get reactions (likes) for the confession
    const reactions = await prisma.confessionReaction.findMany({
      where: { confessionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    
    // For reactions from registered users, we need to look up their info
    // Since reactions use sessionId, we need to check if any sessions belong to registered users
    const sessionIds = [...new Set(reactions.map((r) => r.sessionId))];
    
    // Get users who might have these sessions (check via session cookie pattern)
    // Note: This is a simplified approach - in production you'd have a session-to-user mapping
    
    const likers = reactions.map((reaction) => ({
      id: reaction.id,
      emoji: reaction.emoji,
      sessionId: reaction.sessionId,
      createdAt: reaction.createdAt,
      // Anonymous by default since reactions use sessionId
      isAnonymous: true,
      displayName: `User ${reaction.sessionId.substring(0, 4)}`,
    }));
    
    const totalCount = await prisma.confessionReaction.count({
      where: { confessionId },
    });
    
    // Group by emoji
    const emojiCounts: Record<string, number> = {};
    reactions.forEach((r) => {
      emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
    });
    
    return {
      success: true,
      data: {
        likers,
        totalCount,
        emojiCounts,
        displayText: formatLikeText(totalCount),
      },
    };
  } catch (error) {
    console.error("Error getting confession likes:", error);
    return { success: false, error: "Failed to get likes" };
  }
}

// Get who liked a video post (more like Instagram since users are logged in)
export async function getVideoLikes(videoId: string, limit = 50) {
  try {
    const likes = await prisma.videoLike.findMany({
      where: { videoId },
      include: {
        video: {
          select: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    
    // Get the user info for each like
    const userIds = likes.map((l) => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, isVerified: true },
    });
    
    const userMap = new Map(users.map((u) => [u.id, u]));
    
    const likers = likes.map((like) => {
      const user = userMap.get(like.userId);
      return {
        id: like.id,
        userId: like.userId,
        userName: user?.name || "Anonymous",
        userImage: user?.image,
        isVerified: user?.isVerified || false,
        createdAt: like.createdAt,
      };
    });
    
    const totalCount = await prisma.videoLike.count({
      where: { videoId },
    });
    
    return {
      success: true,
      data: {
        likers,
        totalCount,
        displayText: formatLikeText(totalCount, likers.slice(0, 3)),
      },
    };
  } catch (error) {
    console.error("Error getting video likes:", error);
    return { success: false, error: "Failed to get likes" };
  }
}

// Format "liked by X, Y, and Z others" text like Instagram
function formatLikeText(
  totalCount: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topLikers?: { userName: string }[]
): string {
  if (totalCount === 0) return "Be the first to like this";
  
  if (topLikers && topLikers.length > 0) {
    const names = topLikers.map((l) => l.userName).filter(Boolean);
    if (names.length === 0) return `${totalCount} likes`;
    
    if (totalCount === 1) {
      return `Liked by ${names[0]}`;
    } else if (totalCount === 2 && names.length >= 2) {
      return `Liked by ${names[0]} and ${names[1]}`;
    } else if (names.length >= 1) {
      const othersCount = totalCount - names.length;
      if (othersCount > 0) {
        return `Liked by ${names[0]} and ${othersCount} ${othersCount === 1 ? "other" : "others"}`;
      } else {
        return `Liked by ${names.join(", ")}`;
      }
    }
  }
  
  return `${totalCount} ${totalCount === 1 ? "like" : "likes"}`;
}

// Get reaction summary for a confession
export async function getReactionSummary(confessionId: string) {
  try {
    const sessionId = getSessionId();
    
    // Get all reactions grouped by emoji
    const reactions = await prisma.confessionReaction.groupBy({
      by: ["emoji"],
      where: { confessionId },
      _count: { emoji: true },
    });
    
    // Check if current user has reacted
    const userReactions = await prisma.confessionReaction.findMany({
      where: { confessionId, sessionId },
      select: { emoji: true },
    });
    
    const summary = reactions.map((r) => ({
      emoji: r.emoji,
      count: r._count.emoji,
      hasReacted: userReactions.some((ur) => ur.emoji === r.emoji),
    }));
    
    const totalCount = reactions.reduce((sum, r) => sum + r._count.emoji, 0);
    
    return {
      success: true,
      data: {
        summary,
        totalCount,
        userReactions: userReactions.map((r) => r.emoji),
      },
    };
  } catch (error) {
    console.error("Error getting reaction summary:", error);
    return { success: false, error: "Failed to get reactions" };
  }
}

// Toggle reaction (add or remove)
export async function toggleReaction(confessionId: string, emoji: string) {
  try {
    const sessionId = getSessionId();
    
    const existing = await prisma.confessionReaction.findUnique({
      where: {
        sessionId_confessionId_emoji: {
          sessionId,
          confessionId,
          emoji,
        },
      },
    });
    
    if (existing) {
      await prisma.confessionReaction.delete({
        where: { id: existing.id },
      });
      return { success: true, action: "removed" };
    } else {
      await prisma.confessionReaction.create({
        data: {
          sessionId,
          confessionId,
          emoji,
        },
      });
      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}
