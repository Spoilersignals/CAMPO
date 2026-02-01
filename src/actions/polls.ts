"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getPolls(
  filter: "active" | "ended" | "my" = "active",
  page: number = 1,
  limit: number = 10
): Promise<
  ActionResult<{
    polls: Array<{
      id: string;
      question: string;
      pollNumber: number | null;
      status: string;
      expiresAt: Date | null;
      createdAt: Date;
      isOwner: boolean;
      options: Array<{
        id: string;
        text: string;
        sortOrder: number;
        voteCount: number;
      }>;
      totalVotes: number;
    }>;
    total: number;
    hasMore: boolean;
  }>
> {
  try {
    const sessionId = await getSessionId();
    const skip = (page - 1) * limit;

    let where: Record<string, unknown> = {};

    if (filter === "active") {
      where = {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      };
    } else if (filter === "ended") {
      where = {
        OR: [
          { status: "ENDED" },
          { AND: [{ expiresAt: { not: null } }, { expiresAt: { lte: new Date() } }] },
        ],
      };
    } else if (filter === "my") {
      where = { sessionId };
    }

    const [polls, total] = await Promise.all([
      prisma.anonPoll.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          options: {
            orderBy: { sortOrder: "asc" },
            include: {
              _count: { select: { votes: true } },
            },
          },
          _count: { select: { votes: true } },
        },
      }),
      prisma.anonPoll.count({ where }),
    ]);

    const formattedPolls = polls.map((poll) => {
      const options = poll.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        sortOrder: opt.sortOrder,
        voteCount: opt._count.votes,
      }));
      const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0);

      return {
        id: poll.id,
        question: poll.question,
        pollNumber: poll.pollNumber,
        status: poll.status,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        isOwner: poll.sessionId === sessionId,
        options,
        totalVotes,
      };
    });

    return {
      success: true,
      data: {
        polls: formattedPolls,
        total,
        hasMore: skip + polls.length < total,
      },
    };
  } catch (error) {
    console.error("getPolls error:", error);
    return { success: false, error: "Failed to fetch polls" };
  }
}

export async function createPoll(
  question: string,
  options: string[],
  expiresAt?: Date
): Promise<ActionResult<{ id: string }>> {
  try {
    const sessionId = await getSessionId();

    if (!question.trim()) {
      return { success: false, error: "Question is required" };
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      return { success: false, error: "At least 2 options are required" };
    }
    if (validOptions.length > 6) {
      return { success: false, error: "Maximum 6 options allowed" };
    }

    const lastPoll = await prisma.anonPoll.findFirst({
      orderBy: { pollNumber: "desc" },
      where: { pollNumber: { not: null } },
    });
    const nextPollNumber = (lastPoll?.pollNumber ?? 0) + 1;

    const poll = await prisma.anonPoll.create({
      data: {
        question: question.trim(),
        sessionId,
        status: "ACTIVE",
        pollNumber: nextPollNumber,
        expiresAt: expiresAt || null,
        options: {
          create: validOptions.map((text, index) => ({
            text: text.trim(),
            sortOrder: index,
          })),
        },
      },
    });

    return { success: true, data: { id: poll.id } };
  } catch (error) {
    console.error("createPoll error:", error);
    return { success: false, error: "Failed to create poll" };
  }
}

export async function votePoll(
  pollId: string,
  optionId: string
): Promise<ActionResult<{ voteId: string }>> {
  try {
    const sessionId = await getSessionId();

    const poll = await prisma.anonPoll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
        votes: { where: { sessionId } },
      },
    });

    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    if (poll.status !== "ACTIVE") {
      return { success: false, error: "Poll is not active" };
    }

    if (poll.expiresAt && poll.expiresAt <= new Date()) {
      return { success: false, error: "Poll has expired" };
    }

    if (poll.votes.length > 0) {
      return { success: false, error: "You have already voted on this poll" };
    }

    const validOption = poll.options.find((opt) => opt.id === optionId);
    if (!validOption) {
      return { success: false, error: "Invalid option" };
    }

    const vote = await prisma.anonPollVote.create({
      data: {
        pollId,
        optionId,
        sessionId,
      },
    });

    return { success: true, data: { voteId: vote.id } };
  } catch (error) {
    console.error("votePoll error:", error);
    return { success: false, error: "Failed to submit vote" };
  }
}

export async function getPollResults(pollId: string): Promise<
  ActionResult<{
    id: string;
    question: string;
    pollNumber: number | null;
    status: string;
    expiresAt: Date | null;
    createdAt: Date;
    isOwner: boolean;
    options: Array<{
      id: string;
      text: string;
      sortOrder: number;
      voteCount: number;
      percentage: number;
    }>;
    totalVotes: number;
  }>
> {
  try {
    const sessionId = await getSessionId();

    const poll = await prisma.anonPoll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    const options = poll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      sortOrder: opt.sortOrder,
      voteCount: opt._count.votes,
      percentage: 0,
    }));

    const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0);

    options.forEach((opt) => {
      opt.percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
    });

    return {
      success: true,
      data: {
        id: poll.id,
        question: poll.question,
        pollNumber: poll.pollNumber,
        status: poll.status,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        isOwner: poll.sessionId === sessionId,
        options,
        totalVotes,
      },
    };
  } catch (error) {
    console.error("getPollResults error:", error);
    return { success: false, error: "Failed to fetch poll results" };
  }
}

export async function getMyVote(
  pollId: string
): Promise<ActionResult<{ optionId: string | null; hasVoted: boolean }>> {
  try {
    const sessionId = await getSessionId();

    const vote = await prisma.anonPollVote.findUnique({
      where: {
        pollId_sessionId: {
          pollId,
          sessionId,
        },
      },
    });

    return {
      success: true,
      data: {
        optionId: vote?.optionId ?? null,
        hasVoted: !!vote,
      },
    };
  } catch (error) {
    console.error("getMyVote error:", error);
    return { success: false, error: "Failed to get vote status" };
  }
}

// Legacy exports for backward compatibility with existing pages
export async function submitPoll(data: {
  question: string;
  options: string[];
}): Promise<ActionResult<{ id: string }>> {
  return createPoll(data.question, data.options);
}

export async function getActivePolls(
  page: number = 1,
  limit: number = 10
): Promise<
  ActionResult<{
    polls: Array<{
      id: string;
      question: string;
      pollNumber: number | null;
      createdAt: Date;
      options: Array<{
        id: string;
        text: string;
        voteCount: number;
      }>;
      totalVotes: number;
      commentCount: number;
    }>;
    total: number;
    hasMore: boolean;
  }>
> {
  const result = await getPolls("active", page, limit);
  if (!result.success || !result.data) {
    return result as ActionResult<never>;
  }

  return {
    success: true,
    data: {
      polls: result.data.polls.map((p) => ({
        id: p.id,
        question: p.question,
        pollNumber: p.pollNumber,
        createdAt: p.createdAt,
        options: p.options.map((o) => ({
          id: o.id,
          text: o.text,
          voteCount: o.voteCount,
        })),
        totalVotes: p.totalVotes,
        commentCount: 0,
      })),
      total: result.data.total,
      hasMore: result.data.hasMore,
    },
  };
}

export async function getPollById(id: string): Promise<
  ActionResult<{
    id: string;
    question: string;
    pollNumber: number | null;
    status: string;
    createdAt: Date;
    endsAt: Date | null;
    options: Array<{
      id: string;
      text: string;
      voteCount: number;
    }>;
    totalVotes: number;
    comments: Array<{
      id: string;
      content: string;
      authorName: string | null;
      createdAt: Date;
    }>;
  }>
> {
  const result = await getPollResults(id);
  if (!result.success || !result.data) {
    return result as ActionResult<never>;
  }

  return {
    success: true,
    data: {
      id: result.data.id,
      question: result.data.question,
      pollNumber: result.data.pollNumber,
      status: result.data.status,
      createdAt: result.data.createdAt,
      endsAt: result.data.expiresAt,
      options: result.data.options.map((o) => ({
        id: o.id,
        text: o.text,
        voteCount: o.voteCount,
      })),
      totalVotes: result.data.totalVotes,
      comments: [],
    },
  };
}

export async function getUserVote(
  pollId: string
): Promise<ActionResult<{ optionId: string | null }>> {
  const result = await getMyVote(pollId);
  if (!result.success || !result.data) {
    return result as ActionResult<never>;
  }
  return {
    success: true,
    data: { optionId: result.data.optionId },
  };
}

export async function addPollComment(
  pollId: string,
  content: string,
  authorName?: string
): Promise<ActionResult<{ commentId: string }>> {
  // Comments not supported for AnonPoll - return success but do nothing
  return { success: true, data: { commentId: "" } };
}
