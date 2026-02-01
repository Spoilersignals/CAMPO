"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

function getSessionId() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2);
  }
  return sessionId;
}

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, isVerified: true },
  });
}

// Repost/retweet a confession (or crush/spotted)
export async function repostContent(
  type: "confession" | "crush" | "spotted",
  contentId: string,
  quoteText?: string
) {
  try {
    const sessionId = getSessionId();
    const user = await getSessionUser();
    
    // Check if user is verified (registered)
    const isVerified = !!user;
    const viralBoost = isVerified ? 2.0 : 1.0; // Verified users give 2x viral boost
    
    // Check if already reposted
    const existingRepost = await prisma.repost.findFirst({
      where: {
        sessionId,
        ...(type === "confession" ? { originalConfessionId: contentId } : {}),
        ...(type === "crush" ? { originalCrushId: contentId } : {}),
        ...(type === "spotted" ? { originalSpottedId: contentId } : {}),
      },
    });
    
    if (existingRepost) {
      return { success: false, error: "Already reposted" };
    }
    
    const repost = await prisma.repost.create({
      data: {
        sessionId,
        userId: user?.id,
        originalType: type,
        ...(type === "confession" ? { originalConfessionId: contentId } : {}),
        ...(type === "crush" ? { originalCrushId: contentId } : {}),
        ...(type === "spotted" ? { originalSpottedId: contentId } : {}),
        quoteText,
        isVerifiedUser: isVerified,
        viralBoost,
      },
    });
    
    return { success: true, data: repost };
  } catch (error) {
    console.error("Error creating repost:", error);
    return { success: false, error: "Failed to repost" };
  }
}

// Remove a repost
export async function removeRepost(
  type: "confession" | "crush" | "spotted",
  contentId: string
) {
  try {
    const sessionId = getSessionId();
    
    await prisma.repost.deleteMany({
      where: {
        sessionId,
        ...(type === "confession" ? { originalConfessionId: contentId } : {}),
        ...(type === "crush" ? { originalCrushId: contentId } : {}),
        ...(type === "spotted" ? { originalSpottedId: contentId } : {}),
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error removing repost:", error);
    return { success: false, error: "Failed to remove repost" };
  }
}

// Get repost count and viral score for a piece of content
export async function getRepostStats(
  type: "confession" | "crush" | "spotted",
  contentId: string
) {
  try {
    const reposts = await prisma.repost.findMany({
      where: {
        ...(type === "confession" ? { originalConfessionId: contentId } : {}),
        ...(type === "crush" ? { originalCrushId: contentId } : {}),
        ...(type === "spotted" ? { originalSpottedId: contentId } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });
    
    const totalCount = reposts.length;
    const verifiedCount = reposts.filter((r) => r.isVerifiedUser).length;
    const viralScore = reposts.reduce((sum, r) => sum + r.viralBoost, 0);
    
    // Get who reposted (for display)
    const reposters = reposts.slice(0, 10).map((r) => ({
      id: r.id,
      isVerified: r.isVerifiedUser,
      userName: r.user?.name || "Anonymous",
      userImage: r.user?.image,
      quoteText: r.quoteText,
      createdAt: r.createdAt,
    }));
    
    return {
      success: true,
      data: {
        totalCount,
        verifiedCount,
        anonymousCount: totalCount - verifiedCount,
        viralScore,
        reposters,
      },
    };
  } catch (error) {
    console.error("Error getting repost stats:", error);
    return { success: false, error: "Failed to get repost stats" };
  }
}

// Check if current session has reposted
export async function hasReposted(
  type: "confession" | "crush" | "spotted",
  contentId: string
) {
  try {
    const sessionId = getSessionId();
    
    const repost = await prisma.repost.findFirst({
      where: {
        sessionId,
        ...(type === "confession" ? { originalConfessionId: contentId } : {}),
        ...(type === "crush" ? { originalCrushId: contentId } : {}),
        ...(type === "spotted" ? { originalSpottedId: contentId } : {}),
      },
    });
    
    return { success: true, hasReposted: !!repost };
  } catch (error) {
    console.error("Error checking repost:", error);
    return { success: false, hasReposted: false };
  }
}

// Create a repost (alias for repostContent - used by share-button)
export async function createRepost(
  type: "confession" | "crush" | "spotted",
  contentId: string,
  quoteText?: string
) {
  return repostContent(type, contentId, quoteText);
}

// Get repost count for a piece of content (used by share-button)
export async function getRepostCount(
  type: "confession" | "crush" | "spotted",
  contentId: string
): Promise<number> {
  try {
    const count = await prisma.repost.count({
      where: {
        ...(type === "confession" ? { originalConfessionId: contentId } : {}),
        ...(type === "crush" ? { originalCrushId: contentId } : {}),
        ...(type === "spotted" ? { originalSpottedId: contentId } : {}),
      },
    });
    return count;
  } catch (error) {
    console.error("Error getting repost count:", error);
    return 0;
  }
}

// Get trending content sorted by viral score
export async function getTrendingConfessions(limit = 20) {
  try {
    // Get confessions with their viral scores calculated from reposts
    const confessions = await prisma.confession.findMany({
      where: { status: "APPROVED" },
      include: {
        reposts: true,
        reactions: true,
        _count: {
          select: { comments: true, views: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Get more to sort by viral score
    });
    
    // Calculate viral score for each confession
    const withScores = confessions.map((confession) => {
      const repostScore = confession.reposts.reduce(
        (sum, r) => sum + r.viralBoost,
        0
      );
      const reactionScore = confession.reactions.length * 0.5;
      const commentScore = confession._count.comments * 1.5;
      const viewScore = confession._count.views * 0.1;
      
      // Recency boost (posts from last 24h get bonus)
      const ageInHours =
        (Date.now() - confession.createdAt.getTime()) / (1000 * 60 * 60);
      const recencyBoost = ageInHours < 24 ? 2 : ageInHours < 48 ? 1.5 : 1;
      
      const viralScore =
        (repostScore * 3 + reactionScore + commentScore + viewScore) *
        recencyBoost;
      
      return {
        ...confession,
        viralScore,
        repostCount: confession.reposts.length,
        verifiedRepostCount: confession.reposts.filter((r) => r.isVerifiedUser)
          .length,
      };
    });
    
    // Sort by viral score and take top posts
    withScores.sort((a, b) => b.viralScore - a.viralScore);
    
    return { success: true, data: withScores.slice(0, limit) };
  } catch (error) {
    console.error("Error getting trending confessions:", error);
    return { success: false, error: "Failed to get trending" };
  }
}
