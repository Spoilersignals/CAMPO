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

export async function createRepost(
  originalType: "confession" | "crush" | "spotted",
  originalId: string,
  quoteText?: string
) {
  const sessionId = await getSessionId();

  const data: Record<string, unknown> = {
    sessionId,
    originalType,
    quoteText: quoteText || null,
  };

  if (originalType === "confession") {
    data.originalConfessionId = originalId;
  } else if (originalType === "crush") {
    data.originalCrushId = originalId;
  } else if (originalType === "spotted") {
    data.originalSpottedId = originalId;
  }

  const repost = await prisma.repost.create({
    data: data as Parameters<typeof prisma.repost.create>[0]["data"],
  });

  return { success: true, repost };
}

export async function getReposts(page = 1, limit = 20) {
  const reposts = await prisma.repost.findMany({
    include: {
      originalConfession: {
        include: {
          reactions: true,
          _count: { select: { comments: true } },
        },
      },
      originalCrush: {
        include: {
          reactions: true,
          _count: { select: { comments: true } },
        },
      },
      originalSpotted: {
        include: {
          reactions: true,
          _count: { select: { comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return reposts.map(r => ({
    id: r.id,
    quoteText: r.quoteText,
    originalType: r.originalType,
    original: r.originalConfession || r.originalCrush || r.originalSpotted,
    createdAt: r.createdAt,
  }));
}

export async function getRepostCount(
  originalType: "confession" | "crush" | "spotted",
  originalId: string
) {
  const where: Record<string, unknown> = { originalType };
  
  if (originalType === "confession") {
    where.originalConfessionId = originalId;
  } else if (originalType === "crush") {
    where.originalCrushId = originalId;
  } else if (originalType === "spotted") {
    where.originalSpottedId = originalId;
  }

  return prisma.repost.count({ where });
}
