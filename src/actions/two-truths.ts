"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface TwoTruthsGame {
  id: string;
  statement1: string;
  statement2: string;
  statement3: string;
  createdAt: Date;
  expiresAt: Date;
  totalGuesses: number;
  correctGuesses: number;
  hasGuessed: boolean;
}

export interface GameWithResult extends TwoTruthsGame {
  lieIndex: number;
  userGuess: number | null;
  isCorrect: boolean | null;
}

export async function getActiveGames(
  page: number = 1,
  limit: number = 10
): Promise<
  ActionResult<{
    games: TwoTruthsGame[];
    total: number;
    hasMore: boolean;
  }>
> {
  try {
    const sessionId = await getSessionId();
    const now = new Date();
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      prisma.twoTruthsOneLie.findMany({
        where: {
          status: "ACTIVE",
          expiresAt: { gt: now },
          sessionId: { not: sessionId },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          guesses: true,
          _count: { select: { guesses: true } },
        },
      }),
      prisma.twoTruthsOneLie.count({
        where: {
          status: "ACTIVE",
          expiresAt: { gt: now },
          sessionId: { not: sessionId },
        },
      }),
    ]);

    const formattedGames: TwoTruthsGame[] = games.map((game: { id: string; statement1: string; statement2: string; statement3: string; createdAt: Date; expiresAt: Date; guesses: Array<{ sessionId: string; isCorrect: boolean }>; _count: { guesses: number } }) => {
      const userGuess = game.guesses.find((g: { sessionId: string }) => g.sessionId === sessionId);
      const correctGuesses = game.guesses.filter((g: { isCorrect: boolean }) => g.isCorrect).length;

      return {
        id: game.id,
        statement1: game.statement1,
        statement2: game.statement2,
        statement3: game.statement3,
        createdAt: game.createdAt,
        expiresAt: game.expiresAt,
        totalGuesses: game._count.guesses,
        correctGuesses,
        hasGuessed: !!userGuess,
      };
    });

    return {
      success: true,
      data: {
        games: formattedGames,
        total,
        hasMore: skip + games.length < total,
      },
    };
  } catch (error) {
    console.error("getActiveGames error:", error);
    return { success: false, error: "Failed to fetch games" };
  }
}

export async function createGame(
  statement1: string,
  statement2: string,
  statement3: string,
  lieIndex: number
): Promise<ActionResult<{ id: string }>> {
  try {
    const sessionId = await getSessionId();

    if (!statement1.trim() || !statement2.trim() || !statement3.trim()) {
      return { success: false, error: "All three statements are required" };
    }

    if (lieIndex < 1 || lieIndex > 3) {
      return { success: false, error: "Lie index must be 1, 2, or 3" };
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const game = await prisma.twoTruthsOneLie.create({
      data: {
        statement1: statement1.trim(),
        statement2: statement2.trim(),
        statement3: statement3.trim(),
        lieIndex,
        sessionId,
        expiresAt,
        status: "ACTIVE",
      },
    });

    return { success: true, data: { id: game.id } };
  } catch (error) {
    console.error("createGame error:", error);
    return { success: false, error: "Failed to create game" };
  }
}

export async function makeGuess(
  gameId: string,
  guessedIndex: number
): Promise<ActionResult<{ isCorrect: boolean; lieIndex: number }>> {
  try {
    const sessionId = await getSessionId();

    if (guessedIndex < 1 || guessedIndex > 3) {
      return { success: false, error: "Guessed index must be 1, 2, or 3" };
    }

    const game = await prisma.twoTruthsOneLie.findUnique({
      where: { id: gameId },
      include: {
        guesses: {
          where: { sessionId },
        },
      },
    });

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    if (game.status !== "ACTIVE") {
      return { success: false, error: "Game is not active" };
    }

    if (game.expiresAt < new Date()) {
      return { success: false, error: "Game has expired" };
    }

    if (game.sessionId === sessionId) {
      return { success: false, error: "You cannot guess on your own game" };
    }

    if (game.guesses.length > 0) {
      return { success: false, error: "You have already guessed on this game" };
    }

    const isCorrect = guessedIndex === game.lieIndex;

    await prisma.twoTruthsGuess.create({
      data: {
        gameId,
        sessionId,
        guessedIndex,
        isCorrect,
      },
    });

    return { success: true, data: { isCorrect, lieIndex: game.lieIndex } };
  } catch (error) {
    console.error("makeGuess error:", error);
    return { success: false, error: "Failed to submit guess" };
  }
}

export async function getGameResults(
  gameId: string
): Promise<ActionResult<GameWithResult>> {
  try {
    const sessionId = await getSessionId();

    const game = await prisma.twoTruthsOneLie.findUnique({
      where: { id: gameId },
      include: {
        guesses: true,
        _count: { select: { guesses: true } },
      },
    });

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    const userGuess = game.guesses.find((g: { sessionId: string }) => g.sessionId === sessionId);
    const correctGuesses = game.guesses.filter((g: { isCorrect: boolean }) => g.isCorrect).length;

    return {
      success: true,
      data: {
        id: game.id,
        statement1: game.statement1,
        statement2: game.statement2,
        statement3: game.statement3,
        createdAt: game.createdAt,
        expiresAt: game.expiresAt,
        totalGuesses: game._count.guesses,
        correctGuesses,
        hasGuessed: !!userGuess,
        lieIndex: game.lieIndex,
        userGuess: userGuess?.guessedIndex ?? null,
        isCorrect: userGuess?.isCorrect ?? null,
      },
    };
  } catch (error) {
    console.error("getGameResults error:", error);
    return { success: false, error: "Failed to fetch game results" };
  }
}

export async function getMyGames(
  page: number = 1,
  limit: number = 10
): Promise<
  ActionResult<{
    games: Array<{
      id: string;
      statement1: string;
      statement2: string;
      statement3: string;
      lieIndex: number;
      createdAt: Date;
      expiresAt: Date;
      status: string;
      totalGuesses: number;
      correctGuesses: number;
    }>;
    total: number;
    hasMore: boolean;
  }>
> {
  try {
    const sessionId = await getSessionId();
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      prisma.twoTruthsOneLie.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          guesses: true,
          _count: { select: { guesses: true } },
        },
      }),
      prisma.twoTruthsOneLie.count({ where: { sessionId } }),
    ]);

    const formattedGames = games.map((game: { id: string; statement1: string; statement2: string; statement3: string; lieIndex: number; createdAt: Date; expiresAt: Date; status: string; guesses: Array<{ isCorrect: boolean }>; _count: { guesses: number } }) => ({
      id: game.id,
      statement1: game.statement1,
      statement2: game.statement2,
      statement3: game.statement3,
      lieIndex: game.lieIndex,
      createdAt: game.createdAt,
      expiresAt: game.expiresAt,
      status: game.status,
      totalGuesses: game._count.guesses,
      correctGuesses: game.guesses.filter((g: { isCorrect: boolean }) => g.isCorrect).length,
    }));

    return {
      success: true,
      data: {
        games: formattedGames,
        total,
        hasMore: skip + games.length < total,
      },
    };
  } catch (error) {
    console.error("getMyGames error:", error);
    return { success: false, error: "Failed to fetch your games" };
  }
}

export async function getUserGuess(
  gameId: string
): Promise<ActionResult<{ guessedIndex: number | null; isCorrect: boolean | null; lieIndex: number | null }>> {
  try {
    const sessionId = await getSessionId();

    const game = await prisma.twoTruthsOneLie.findUnique({
      where: { id: gameId },
      include: {
        guesses: {
          where: { sessionId },
        },
      },
    });

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    const userGuess = game.guesses[0];

    return {
      success: true,
      data: {
        guessedIndex: userGuess?.guessedIndex ?? null,
        isCorrect: userGuess?.isCorrect ?? null,
        lieIndex: userGuess ? game.lieIndex : null,
      },
    };
  } catch (error) {
    console.error("getUserGuess error:", error);
    return { success: false, error: "Failed to get user guess" };
  }
}
