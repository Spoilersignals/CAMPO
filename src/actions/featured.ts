"use server";

import { prisma } from "@/lib/prisma";

export async function getFeaturedContent() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const featured = await prisma.featuredContent.findFirst({
    where: {
      featuredDate: { gte: today },
    },
    include: {
      confession: {
        include: {
          reactions: true,
          _count: { select: { comments: true } },
        },
      },
      crush: {
        include: {
          reactions: true,
          _count: { select: { comments: true } },
        },
      },
      spotted: {
        include: {
          reactions: true,
          _count: { select: { comments: true } },
        },
      },
    },
    orderBy: { featuredDate: "desc" },
  });

  if (!featured) return null;

  return {
    id: featured.id,
    contentType: featured.contentType,
    content: featured.confession || featured.crush || featured.spotted,
    reason: featured.reason,
    featuredDate: featured.featuredDate,
  };
}

export async function getAllFeatured(limit = 10) {
  const featured = await prisma.featuredContent.findMany({
    include: {
      confession: { select: { id: true, content: true, confessionNumber: true } },
      crush: { select: { id: true, title: true, crushNumber: true } },
      spotted: { select: { id: true, content: true, spottedNumber: true } },
    },
    orderBy: { featuredDate: "desc" },
    take: limit,
  });

  return featured.map(f => ({
    id: f.id,
    contentType: f.contentType,
    content: f.confession || f.crush || f.spotted,
    reason: f.reason,
    featuredDate: f.featuredDate,
  }));
}

// Auto-select featured content based on engagement
export async function autoSelectFeatured() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Find confession with most reactions in last 24h
  const topConfession = await prisma.confession.findFirst({
    where: {
      status: "APPROVED",
      createdAt: { gte: yesterday },
    },
    orderBy: {
      reactions: { _count: "desc" },
    },
  });

  if (!topConfession) return null;

  // Check if already featured
  const alreadyFeatured = await prisma.featuredContent.findUnique({
    where: { confessionId: topConfession.id },
  });

  if (alreadyFeatured) return alreadyFeatured;

  return prisma.featuredContent.create({
    data: {
      contentType: "confession",
      confessionId: topConfession.id,
      reason: "🔥 Most popular today",
    },
  });
}

// Manual feature by admin
export async function featureContent(
  contentType: "confession" | "crush" | "spotted",
  contentId: string,
  reason?: string
) {
  const data: Record<string, unknown> = {
    contentType,
    reason: reason || "✨ Editor's Pick",
  };

  if (contentType === "confession") {
    data.confessionId = contentId;
  } else if (contentType === "crush") {
    data.crushId = contentId;
  } else if (contentType === "spotted") {
    data.spottedId = contentId;
  }

  return prisma.featuredContent.create({
    data: data as Parameters<typeof prisma.featuredContent.create>[0]["data"],
  });
}
