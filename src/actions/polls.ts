"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function submitPoll(data: {
  question: string;
  options: string[];
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.question.trim()) {
      return { success: false, error: "Question is required" };
    }

    if (data.options.length < 2) {
      return { success: false, error: "At least 2 options are required" };
    }

    const validOptions = data.options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      return { success: false, error: "At least 2 valid options are required" };
    }

    const poll = await prisma.poll.create({
      data: {
        question: data.question.trim(),
        status: "PENDING",
        options: {
          create: validOptions.map((text) => ({ text: text.trim() })),
        },
      },
    });

    return { success: true, data: { id: poll.id } };
  } catch (error) {
    console.error("submitPoll error:", error);
    return { success: false, error: "Failed to submit poll" };
  }
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
  try {
    const skip = (page - 1) * limit;

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          options: {
            include: {
              _count: { select: { votes: true } },
            },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.poll.count({ where: { status: "ACTIVE" } }),
    ]);

    const formattedPolls = polls.map((poll) => {
      const options = poll.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt._count.votes,
      }));
      const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0);

      return {
        id: poll.id,
        question: poll.question,
        pollNumber: poll.pollNumber,
        createdAt: poll.createdAt,
        options,
        totalVotes,
        commentCount: poll._count.comments,
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
    console.error("getActivePolls error:", error);
    return { success: false, error: "Failed to fetch polls" };
  }
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
  try {
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    const options = poll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      voteCount: opt._count.votes,
    }));
    const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0);

    return {
      success: true,
      data: {
        id: poll.id,
        question: poll.question,
        pollNumber: poll.pollNumber,
        status: poll.status,
        createdAt: poll.createdAt,
        endsAt: poll.endsAt,
        options,
        totalVotes,
        comments: poll.comments.map((c) => ({
          id: c.id,
          content: c.content,
          authorName: c.authorName,
          createdAt: c.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error("getPollById error:", error);
    return { success: false, error: "Failed to fetch poll" };
  }
}

export async function votePoll(
  optionId: string
): Promise<ActionResult<{ voteId: string }>> {
  try {
    const sessionId = await getSessionId();

    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: {
        poll: {
          include: {
            options: {
              include: {
                votes: {
                  where: { sessionId },
                },
              },
            },
          },
        },
      },
    });

    if (!option) {
      return { success: false, error: "Option not found" };
    }

    if (option.poll.status !== "ACTIVE") {
      return { success: false, error: "Poll is not active" };
    }

    const hasVoted = option.poll.options.some((opt) => opt.votes.length > 0);
    if (hasVoted) {
      return { success: false, error: "You have already voted on this poll" };
    }

    const vote = await prisma.pollVote.create({
      data: {
        sessionId,
        optionId,
      },
    });

    return { success: true, data: { voteId: vote.id } };
  } catch (error) {
    console.error("votePoll error:", error);
    return { success: false, error: "Failed to submit vote" };
  }
}

export async function addPollComment(
  pollId: string,
  content: string,
  authorName?: string
): Promise<ActionResult<{ commentId: string }>> {
  try {
    if (!content.trim()) {
      return { success: false, error: "Comment content is required" };
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    if (poll.status !== "ACTIVE") {
      return { success: false, error: "Poll is not active" };
    }

    const comment = await prisma.pollComment.create({
      data: {
        pollId,
        content: content.trim(),
        authorName: authorName?.trim() || null,
      },
    });

    return { success: true, data: { commentId: comment.id } };
  } catch (error) {
    console.error("addPollComment error:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getUserVote(
  pollId: string
): Promise<ActionResult<{ optionId: string | null }>> {
  try {
    const sessionId = await getSessionId();

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: {
              where: { sessionId },
            },
          },
        },
      },
    });

    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    const votedOption = poll.options.find((opt) => opt.votes.length > 0);

    return {
      success: true,
      data: { optionId: votedOption?.id ?? null },
    };
  } catch (error) {
    console.error("getUserVote error:", error);
    return { success: false, error: "Failed to get user vote" };
  }
}
