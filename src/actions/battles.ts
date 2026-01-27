"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get("anon_session")?.value || crypto.randomUUID();
}

export async function getActiveBattles() {
  const now = new Date();
  return prisma.confessionBattle.findMany({
    where: {
      status: "ACTIVE",
      endsAt: { gt: now },
    },
    include: {
      confession1: {
        select: { id: true, content: true, confessionNumber: true },
      },
      confession2: {
        select: { id: true, content: true, confessionNumber: true },
      },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function voteBattle(battleId: string, votedFor: 1 | 2) {
  const sessionId = await getSessionId();

  const existing = await prisma.battleVote.findUnique({
    where: { sessionId_battleId: { sessionId, battleId } },
  });

  if (existing) {
    return { success: false, error: "Already voted" };
  }

  await prisma.$transaction([
    prisma.battleVote.create({
      data: { sessionId, battleId, votedFor },
    }),
    prisma.confessionBattle.update({
      where: { id: battleId },
      data: votedFor === 1 
        ? { winner1Votes: { increment: 1 } }
        : { winner2Votes: { increment: 1 } },
    }),
  ]);

  return { success: true };
}

export async function getMyVote(battleId: string) {
  const sessionId = await getSessionId();
  const vote = await prisma.battleVote.findUnique({
    where: { sessionId_battleId: { sessionId, battleId } },
  });
  return vote?.votedFor || null;
}

export async function getBattleResults(battleId: string) {
  const battle = await prisma.confessionBattle.findUnique({
    where: { id: battleId },
    include: {
      confession1: { select: { id: true, content: true, confessionNumber: true } },
      confession2: { select: { id: true, content: true, confessionNumber: true } },
    },
  });

  if (!battle) return null;

  const total = battle.winner1Votes + battle.winner2Votes;
  return {
    ...battle,
    percent1: total > 0 ? Math.round((battle.winner1Votes / total) * 100) : 50,
    percent2: total > 0 ? Math.round((battle.winner2Votes / total) * 100) : 50,
  };
}

// Admin function to create a new battle
export async function createBattle(confession1Id: string, confession2Id: string, durationHours = 24) {
  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + durationHours);

  return prisma.confessionBattle.create({
    data: {
      confession1Id,
      confession2Id,
      endsAt,
    },
  });
}
