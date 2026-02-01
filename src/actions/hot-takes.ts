"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type SortOption = "controversial" | "hot" | "new";

export async function getHotTakes(
  page: number = 1,
  limit: number = 10,
  sort: SortOption = "hot"
): Promise<
  ActionResult<{
    hotTakes: Array<{
      id: string;
      content: string;
      takeNumber: number | null;
      agreeCount: number;
      disagreeCount: number;
      totalVotes: number;
      agreePercentage: number;
      isControversial: boolean;
      commentCount: number;
      createdAt: Date;
      userVote: string | null;
    }>;
    total: number;
    hasMore: boolean;
  }>
> {
  try {
    const sessionId = await getSessionId();
    const skip = (page - 1) * limit;

    const [hotTakes, total] = await Promise.all([
      prisma.hotTake.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          votes: {
            where: { sessionId },
            take: 1,
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.hotTake.count({ where: { status: "APPROVED" } }),
    ]);

    let formattedTakes = hotTakes.map((take: {
      id: string;
      content: string;
      takeNumber: number | null;
      agreeCount: number;
      disagreeCount: number;
      createdAt: Date;
      votes: Array<{ voteType: string }>;
      _count: { comments: number };
    }) => {
      const totalVotes = take.agreeCount + take.disagreeCount;
      const agreePercentage = totalVotes > 0 ? Math.round((take.agreeCount / totalVotes) * 100) : 50;
      const isControversial = totalVotes >= 10 && agreePercentage >= 40 && agreePercentage <= 60;

      return {
        id: take.id,
        content: take.content,
        takeNumber: take.takeNumber,
        agreeCount: take.agreeCount,
        disagreeCount: take.disagreeCount,
        totalVotes,
        agreePercentage,
        isControversial,
        commentCount: take._count.comments,
        createdAt: take.createdAt,
        userVote: take.votes[0]?.voteType ?? null,
      };
    });

    type FormattedTake = typeof formattedTakes[number];
    
    // Apply sorting
    if (sort === "controversial") {
      // Sort by how close to 50/50, with more votes first
      formattedTakes.sort((a: FormattedTake, b: FormattedTake) => {
        const aControversy = Math.abs(50 - a.agreePercentage);
        const bControversy = Math.abs(50 - b.agreePercentage);
        if (aControversy !== bControversy) return aControversy - bControversy;
        return b.totalVotes - a.totalVotes;
      });
    } else if (sort === "hot") {
      // Sort by engagement (total votes + comments) weighted by recency
      formattedTakes.sort((a: FormattedTake, b: FormattedTake) => {
        const aScore = (a.totalVotes + a.commentCount * 2) * Math.pow(0.9, (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const bScore = (b.totalVotes + b.commentCount * 2) * Math.pow(0.9, (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return bScore - aScore;
      });
    }
    // "new" keeps the default createdAt desc order

    const paginatedTakes = formattedTakes.slice(skip, skip + limit);

    return {
      success: true,
      data: {
        hotTakes: paginatedTakes,
        total,
        hasMore: skip + paginatedTakes.length < total,
      },
    };
  } catch (error) {
    console.error("getHotTakes error:", error);
    return { success: false, error: "Failed to fetch hot takes" };
  }
}

export async function createHotTake(
  content: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const sessionId = await getSessionId();

    if (!content.trim()) {
      return { success: false, error: "Content is required" };
    }

    if (content.length > 280) {
      return { success: false, error: "Hot take must be 280 characters or less" };
    }

    const hotTake = await prisma.hotTake.create({
      data: {
        content: content.trim(),
        sessionId,
        status: "PENDING",
      },
    });

    return { success: true, data: { id: hotTake.id } };
  } catch (error) {
    console.error("createHotTake error:", error);
    return { success: false, error: "Failed to submit hot take" };
  }
}

export async function voteHotTake(
  hotTakeId: string,
  voteType: "AGREE" | "DISAGREE"
): Promise<ActionResult<{ voteId: string; newAgreeCount: number; newDisagreeCount: number }>> {
  try {
    const sessionId = await getSessionId();

    const hotTake = await prisma.hotTake.findUnique({
      where: { id: hotTakeId },
      include: {
        votes: {
          where: { sessionId },
        },
      },
    });

    if (!hotTake) {
      return { success: false, error: "Hot take not found" };
    }

    if (hotTake.status !== "APPROVED") {
      return { success: false, error: "Hot take is not available for voting" };
    }

    if (hotTake.votes.length > 0) {
      return { success: false, error: "You have already voted on this hot take" };
    }

    const [vote] = await prisma.$transaction([
      prisma.hotTakeVote.create({
        data: {
          hotTakeId,
          sessionId,
          voteType,
        },
      }),
      prisma.hotTake.update({
        where: { id: hotTakeId },
        data: {
          agreeCount: voteType === "AGREE" ? { increment: 1 } : undefined,
          disagreeCount: voteType === "DISAGREE" ? { increment: 1 } : undefined,
        },
      }),
    ]);

    const updatedTake = await prisma.hotTake.findUnique({
      where: { id: hotTakeId },
      select: { agreeCount: true, disagreeCount: true },
    });

    return {
      success: true,
      data: {
        voteId: vote.id,
        newAgreeCount: updatedTake?.agreeCount ?? 0,
        newDisagreeCount: updatedTake?.disagreeCount ?? 0,
      },
    };
  } catch (error) {
    console.error("voteHotTake error:", error);
    return { success: false, error: "Failed to submit vote" };
  }
}

export async function commentOnHotTake(
  hotTakeId: string,
  content: string
): Promise<ActionResult<{ commentId: string }>> {
  try {
    const sessionId = await getSessionId();

    if (!content.trim()) {
      return { success: false, error: "Comment content is required" };
    }

    const hotTake = await prisma.hotTake.findUnique({
      where: { id: hotTakeId },
    });

    if (!hotTake) {
      return { success: false, error: "Hot take not found" };
    }

    if (hotTake.status !== "APPROVED") {
      return { success: false, error: "Hot take is not available for comments" };
    }

    const comment = await prisma.hotTakeComment.create({
      data: {
        hotTakeId,
        content: content.trim(),
        sessionId,
      },
    });

    return { success: true, data: { commentId: comment.id } };
  } catch (error) {
    console.error("commentOnHotTake error:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getHotTakeWithComments(
  id: string
): Promise<
  ActionResult<{
    id: string;
    content: string;
    takeNumber: number | null;
    agreeCount: number;
    disagreeCount: number;
    totalVotes: number;
    agreePercentage: number;
    isControversial: boolean;
    createdAt: Date;
    userVote: string | null;
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
    }>;
  }>
> {
  try {
    const sessionId = await getSessionId();

    const hotTake = await prisma.hotTake.findUnique({
      where: { id },
      include: {
        votes: {
          where: { sessionId },
          take: 1,
        },
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!hotTake) {
      return { success: false, error: "Hot take not found" };
    }

    const totalVotes = hotTake.agreeCount + hotTake.disagreeCount;
    const agreePercentage = totalVotes > 0 ? Math.round((hotTake.agreeCount / totalVotes) * 100) : 50;
    const isControversial = totalVotes >= 10 && agreePercentage >= 40 && agreePercentage <= 60;

    return {
      success: true,
      data: {
        id: hotTake.id,
        content: hotTake.content,
        takeNumber: hotTake.takeNumber,
        agreeCount: hotTake.agreeCount,
        disagreeCount: hotTake.disagreeCount,
        totalVotes,
        agreePercentage,
        isControversial,
        createdAt: hotTake.createdAt,
        userVote: hotTake.votes[0]?.voteType ?? null,
        comments: hotTake.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error("getHotTakeWithComments error:", error);
    return { success: false, error: "Failed to fetch hot take" };
  }
}
