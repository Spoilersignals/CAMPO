"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get("anon_session")?.value || crypto.randomUUID();
}

export async function updateStreak() {
  const sessionId = await getSessionId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.userStreak.findUnique({
    where: { sessionId },
  });

  if (!streak) {
    return prisma.userStreak.create({
      data: {
        sessionId,
        currentStreak: 1,
        longestStreak: 1,
        lastPostDate: new Date(),
        totalPosts: 1,
      },
    });
  }

  const lastPost = streak.lastPostDate ? new Date(streak.lastPostDate) : null;
  if (lastPost) {
    lastPost.setHours(0, 0, 0, 0);
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = streak.currentStreak;

  if (lastPost && lastPost.getTime() === today.getTime()) {
    // Already posted today, just increment total
    return prisma.userStreak.update({
      where: { sessionId },
      data: { totalPosts: { increment: 1 } },
    });
  } else if (lastPost && lastPost.getTime() === yesterday.getTime()) {
    // Posted yesterday, continue streak
    newStreak += 1;
  } else {
    // Streak broken, start fresh
    newStreak = 1;
  }

  return prisma.userStreak.update({
    where: { sessionId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastPostDate: new Date(),
      totalPosts: { increment: 1 },
    },
  });
}

export async function getMyStreak() {
  const sessionId = await getSessionId();
  return prisma.userStreak.findUnique({ where: { sessionId } });
}

export async function getTopStreaks(limit = 10) {
  return prisma.userStreak.findMany({
    orderBy: { currentStreak: "desc" },
    take: limit,
    select: {
      sessionId: true,
      currentStreak: true,
      longestStreak: true,
      totalPosts: true,
    },
  });
}
