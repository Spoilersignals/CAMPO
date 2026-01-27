"use server";

import { prisma } from "@/lib/prisma";

type Period = "weekly" | "monthly" | "alltime";
type Category = "top_poster" | "funniest" | "most_helpful" | "streak_master";

function getPeriodDates(period: Period) {
  const now = new Date();
  const start = new Date();

  if (period === "weekly") {
    start.setDate(now.getDate() - 7);
  } else if (period === "monthly") {
    start.setMonth(now.getMonth() - 1);
  } else {
    start.setFullYear(2020); // All time
  }

  return { start, end: now };
}

export async function getLeaderboard(category: Category, period: Period = "weekly", limit = 10) {
  const { start, end } = getPeriodDates(period);

  const entries = await prisma.leaderboardEntry.findMany({
    where: {
      category,
      period,
      periodStart: { gte: start },
    },
    orderBy: { score: "desc" },
    take: limit,
  });

  // Join with personas to get display info
  const sessionIds = entries.map(e => e.sessionId);
  const personas = await prisma.anonymousPersona.findMany({
    where: { sessionId: { in: sessionIds } },
  });

  const personaMap = new Map(personas.map(p => [p.sessionId, p]));

  return entries.map((entry, index) => ({
    rank: index + 1,
    score: entry.score,
    persona: personaMap.get(entry.sessionId) || {
      avatar: "👤",
      alias: "Anonymous",
      color: "#888",
    },
  }));
}

export async function updateLeaderboardScore(
  sessionId: string,
  category: Category,
  scoreChange: number
) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const allTimeStart = new Date(2020, 0, 1);

  // Update all periods
  const periods: { period: Period; start: Date }[] = [
    { period: "weekly", start: weekStart },
    { period: "monthly", start: monthStart },
    { period: "alltime", start: allTimeStart },
  ];

  for (const { period, start } of periods) {
    await prisma.leaderboardEntry.upsert({
      where: {
        sessionId_category_period_periodStart: {
          sessionId,
          category,
          period,
          periodStart: start,
        },
      },
      create: {
        sessionId,
        category,
        period,
        periodStart: start,
        score: scoreChange,
      },
      update: {
        score: { increment: scoreChange },
      },
    });
  }
}

export async function getMyRank(category: Category, period: Period = "weekly") {
  const { start } = getPeriodDates(period);

  const entries = await prisma.leaderboardEntry.findMany({
    where: {
      category,
      period,
      periodStart: { gte: start },
    },
    orderBy: { score: "desc" },
    select: { sessionId: true, score: true },
  });

  // This would need the actual session ID to find rank
  return entries;
}
