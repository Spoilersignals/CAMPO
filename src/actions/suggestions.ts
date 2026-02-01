"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type ItemSuggestionData = {
  id: string;
  content: string;
  userId: string | null;
  userName: string | null;
  sessionId: string;
  expiresAt: Date;
  status: string;
  createdAt: Date;
  responseCount: number;
};

/**
 * Create a new item suggestion (I need X)
 */
export async function createSuggestion(
  content: string,
  sessionId: string
): Promise<{ success: boolean; error?: string; suggestion?: ItemSuggestionData }> {
  try {
    if (!content.trim() || content.length < 5) {
      return { success: false, error: "Please describe what you need (min 5 characters)" };
    }

    if (content.length > 200) {
      return { success: false, error: "Description too long (max 200 characters)" };
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // If registered user, suggestion is permanent. Otherwise, 36 hours
    const expiresAt = userId 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year for registered users
      : new Date(Date.now() + 36 * 60 * 60 * 1000); // 36 hours for anonymous

    const suggestion = await prisma.itemSuggestion.create({
      data: {
        content: content.trim(),
        userId,
        sessionId,
        expiresAt,
        status: "ACTIVE",
      },
      include: {
        user: { select: { name: true } },
        _count: { select: { responses: true } },
      },
    });

    return {
      success: true,
      suggestion: {
        id: suggestion.id,
        content: suggestion.content,
        userId: suggestion.userId,
        userName: suggestion.user?.name || null,
        sessionId: suggestion.sessionId,
        expiresAt: suggestion.expiresAt,
        status: suggestion.status,
        createdAt: suggestion.createdAt,
        responseCount: suggestion._count.responses,
      },
    };
  } catch (error) {
    console.error("Error creating suggestion:", error);
    return { success: false, error: "Failed to create suggestion" };
  }
}

/**
 * Get active suggestions
 */
export async function getActiveSuggestions(
  limit: number = 10
): Promise<{ success: boolean; suggestions: ItemSuggestionData[] }> {
  try {
    const suggestions = await prisma.itemSuggestion.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { name: true } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      success: true,
      suggestions: suggestions.map((s) => ({
        id: s.id,
        content: s.content,
        userId: s.userId,
        userName: s.user?.name || null,
        sessionId: s.sessionId,
        expiresAt: s.expiresAt,
        status: s.status,
        createdAt: s.createdAt,
        responseCount: s._count.responses,
      })),
    };
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return { success: false, suggestions: [] };
  }
}

/**
 * Respond to a suggestion (seller offers to help)
 */
export async function respondToSuggestion(
  suggestionId: string,
  message?: string,
  listingId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to respond" };
    }

    // Check if suggestion exists and is active
    const suggestion = await prisma.itemSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion || suggestion.status !== "ACTIVE") {
      return { success: false, error: "Suggestion not found or no longer active" };
    }

    // Check if user already responded
    const existingResponse = await prisma.itemSuggestionResponse.findFirst({
      where: {
        suggestionId,
        sellerId: session.user.id,
      },
    });

    if (existingResponse) {
      return { success: false, error: "You already responded to this suggestion" };
    }

    await prisma.itemSuggestionResponse.create({
      data: {
        suggestionId,
        sellerId: session.user.id,
        message,
        listingId,
      },
    });

    // Create notification for the suggestion owner if they're registered
    if (suggestion.userId) {
      await prisma.notification.create({
        data: {
          userId: suggestion.userId,
          type: "SUGGESTION_RESPONSE",
          title: "Someone can help!",
          body: `A seller responded to your request: "${suggestion.content.slice(0, 50)}..."`,
          link: `/suggestions/${suggestionId}`,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error responding to suggestion:", error);
    return { success: false, error: "Failed to respond" };
  }
}

export type SuggestionResponseData = {
  id: string;
  sellerId: string;
  sellerName: string | null;
  sellerImage: string | null;
  message: string | null;
  listingId: string | null;
  listingTitle: string | null;
  listingPrice: number | null;
  createdAt: Date;
};

export type SuggestionDetailData = ItemSuggestionData & {
  responses: SuggestionResponseData[];
};

/**
 * Get a single suggestion with its responses
 */
export async function getSuggestionById(
  id: string
): Promise<{ success: boolean; suggestion?: SuggestionDetailData; error?: string }> {
  try {
    const suggestion = await prisma.itemSuggestion.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        _count: { select: { responses: true } },
        responses: {
          include: {
            seller: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!suggestion) {
      return { success: false, error: "Suggestion not found" };
    }

    const responsesWithListings = await Promise.all(
      suggestion.responses.map(async (r) => {
        let listingTitle: string | null = null;
        let listingPrice: number | null = null;
        if (r.listingId) {
          const listing = await prisma.listing.findUnique({
            where: { id: r.listingId },
            select: { title: true, price: true },
          });
          listingTitle = listing?.title || null;
          listingPrice = listing?.price || null;
        }
        return {
          id: r.id,
          sellerId: r.sellerId,
          sellerName: r.seller?.name || null,
          sellerImage: r.seller?.image || null,
          message: r.message,
          listingId: r.listingId,
          listingTitle,
          listingPrice,
          createdAt: r.createdAt,
        };
      })
    );

    return {
      success: true,
      suggestion: {
        id: suggestion.id,
        content: suggestion.content,
        userId: suggestion.userId,
        userName: suggestion.user?.name || null,
        sessionId: suggestion.sessionId,
        expiresAt: suggestion.expiresAt,
        status: suggestion.status,
        createdAt: suggestion.createdAt,
        responseCount: suggestion._count.responses,
        responses: responsesWithListings,
      },
    };
  } catch (error) {
    console.error("Error fetching suggestion:", error);
    return { success: false, error: "Failed to fetch suggestion" };
  }
}

/**
 * Get user's own listings for linking to response
 */
export async function getUserListings(): Promise<{
  success: boolean;
  listings: { id: string; title: string; price: number }[];
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, listings: [] };
    }

    const listings = await prisma.listing.findMany({
      where: {
        sellerId: session.user.id,
        status: "ACTIVE",
      },
      select: { id: true, title: true, price: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, listings };
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return { success: false, listings: [] };
  }
}

/**
 * Mark suggestion as fulfilled
 */
export async function fulfillSuggestion(
  suggestionId: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    
    const suggestion = await prisma.itemSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      return { success: false, error: "Suggestion not found" };
    }

    // Check ownership
    const isOwner = session?.user?.id 
      ? suggestion.userId === session.user.id
      : suggestion.sessionId === sessionId;

    if (!isOwner) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.itemSuggestion.update({
      where: { id: suggestionId },
      data: { status: "FULFILLED" },
    });

    return { success: true };
  } catch (error) {
    console.error("Error fulfilling suggestion:", error);
    return { success: false, error: "Failed to update" };
  }
}
