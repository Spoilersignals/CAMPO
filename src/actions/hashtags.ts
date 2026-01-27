"use server";

import { prisma } from "@/lib/prisma";

// Extract hashtags from content (internal helper, not exported as server action)
function extractHashtagsFromContent(content: string): string[] {
  const regex = /#(\w+)/g;
  const matches = content.match(regex);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}

// Create or update hashtags and link them to content
export async function linkHashtags(
  content: string,
  contentType: "confession" | "crush" | "spotted",
  contentId: string
) {
  const tags = extractHashtagsFromContent(content);
  if (tags.length === 0) return;

  for (const tagName of tags) {
    // Upsert hashtag
    const hashtag = await prisma.hashtag.upsert({
      where: { name: tagName },
      create: { name: tagName, postCount: 1 },
      update: { postCount: { increment: 1 } },
    });

    // Link to content
    if (contentType === "confession") {
      await prisma.hashtagOnConfession.upsert({
        where: { hashtagId_confessionId: { hashtagId: hashtag.id, confessionId: contentId } },
        create: { hashtagId: hashtag.id, confessionId: contentId },
        update: {},
      });
    } else if (contentType === "crush") {
      await prisma.hashtagOnCrush.upsert({
        where: { hashtagId_crushId: { hashtagId: hashtag.id, crushId: contentId } },
        create: { hashtagId: hashtag.id, crushId: contentId },
        update: {},
      });
    } else if (contentType === "spotted") {
      await prisma.hashtagOnSpotted.upsert({
        where: { hashtagId_spottedId: { hashtagId: hashtag.id, spottedId: contentId } },
        create: { hashtagId: hashtag.id, spottedId: contentId },
        update: {},
      });
    }
  }
}

// Get trending hashtags (top 10 by post count in last 7 days)
export async function getTrendingHashtags(limit = 10) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const hashtags = await prisma.hashtag.findMany({
    where: {
      updatedAt: { gte: sevenDaysAgo },
    },
    orderBy: { postCount: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      postCount: true,
    },
  });

  return hashtags;
}

// Search hashtags
export async function searchHashtags(query: string) {
  const hashtags = await prisma.hashtag.findMany({
    where: {
      name: { contains: query.toLowerCase() },
    },
    orderBy: { postCount: "desc" },
    take: 20,
  });

  return hashtags;
}

// Get posts by hashtag
export async function getPostsByHashtag(hashtagName: string, page = 1, limit = 20) {
  const hashtag = await prisma.hashtag.findUnique({
    where: { name: hashtagName.toLowerCase() },
  });

  if (!hashtag) return { hashtag: null, posts: [] };

  // Fetch linked content separately
  const [confessionLinks, spottedLinks, crushLinks] = await Promise.all([
    prisma.hashtagOnConfession.findMany({
      where: { hashtagId: hashtag.id },
      include: {
        confession: {
          include: {
            reactions: true,
            _count: { select: { comments: true } },
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.hashtagOnSpotted.findMany({
      where: { hashtagId: hashtag.id },
      include: {
        spotted: {
          include: {
            reactions: true,
            _count: { select: { comments: true } },
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.hashtagOnCrush.findMany({
      where: { hashtagId: hashtag.id },
      include: {
        crush: {
          include: {
            reactions: true,
            _count: { select: { comments: true } },
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);

  // Combine and sort all posts (only approved ones)
  const allPosts = [
    ...confessionLinks
      .filter((c) => c.confession && c.confession.status === "APPROVED")
      .map((c) => ({
        type: "confession" as const,
        id: c.confession.id,
        content: c.confession.content,
        createdAt: c.confession.createdAt,
        confessionNumber: c.confession.confessionNumber,
      })),
    ...spottedLinks
      .filter((s) => s.spotted && s.spotted.status === "APPROVED")
      .map((s) => ({
        type: "spotted" as const,
        id: s.spotted.id,
        content: s.spotted.content,
        createdAt: s.spotted.createdAt,
        spottedNumber: s.spotted.spottedNumber,
      })),
    ...crushLinks
      .filter((c) => c.crush && c.crush.status === "APPROVED")
      .map((c) => ({
        type: "crush" as const,
        id: c.crush.id,
        title: c.crush.title,
        createdAt: c.crush.createdAt,
        crushNumber: c.crush.crushNumber,
      })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    hashtag: { id: hashtag.id, name: hashtag.name, postCount: hashtag.postCount },
    posts: allPosts.slice(0, limit),
  };
}
