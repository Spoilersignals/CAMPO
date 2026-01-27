"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("anon_session")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export async function toggleBookmark(
  contentType: "confession" | "crush" | "spotted" | "poll",
  contentId: string
) {
  const sessionId = await getSessionId();

  const whereClause: Record<string, unknown> = {
    sessionId,
    contentType,
  };

  if (contentType === "confession") {
    whereClause.confessionId = contentId;
  } else if (contentType === "crush") {
    whereClause.crushId = contentId;
  } else if (contentType === "spotted") {
    whereClause.spottedId = contentId;
  } else if (contentType === "poll") {
    whereClause.pollId = contentId;
  }

  const existing = await prisma.bookmark.findFirst({ where: whereClause });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { success: true, bookmarked: false };
  }

  const createData: Record<string, unknown> = {
    sessionId,
    contentType,
  };

  if (contentType === "confession") {
    createData.confessionId = contentId;
  } else if (contentType === "crush") {
    createData.crushId = contentId;
  } else if (contentType === "spotted") {
    createData.spottedId = contentId;
  } else if (contentType === "poll") {
    createData.pollId = contentId;
  }

  await prisma.bookmark.create({ data: createData as Parameters<typeof prisma.bookmark.create>[0]["data"] });
  return { success: true, bookmarked: true };
}

export async function isBookmarked(
  contentType: "confession" | "crush" | "spotted" | "poll",
  contentId: string
) {
  const sessionId = await getSessionId();

  const whereClause: Record<string, unknown> = {
    sessionId,
    contentType,
  };

  if (contentType === "confession") {
    whereClause.confessionId = contentId;
  } else if (contentType === "crush") {
    whereClause.crushId = contentId;
  } else if (contentType === "spotted") {
    whereClause.spottedId = contentId;
  } else if (contentType === "poll") {
    whereClause.pollId = contentId;
  }

  const bookmark = await prisma.bookmark.findFirst({ where: whereClause });
  return !!bookmark;
}

export async function getMyBookmarks(page = 1, limit = 20) {
  const sessionId = await getSessionId();

  const bookmarks = await prisma.bookmark.findMany({
    where: { sessionId },
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
      poll: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return bookmarks.map(b => ({
    id: b.id,
    contentType: b.contentType,
    createdAt: b.createdAt,
    content: b.confession || b.crush || b.spotted || b.poll,
  }));
}

export async function getBookmarkCount() {
  const sessionId = await getSessionId();
  return prisma.bookmark.count({ where: { sessionId } });
}
