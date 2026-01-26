"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function createItemRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a request" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budgetStr = formData.get("budget") as string;
  const condition = formData.get("condition") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!title || title.length < 3) {
    return { fieldErrors: { title: ["Title must be at least 3 characters"] } };
  }

  if (!categoryId) {
    return { fieldErrors: { categoryId: ["Category is required"] } };
  }

  const budget = budgetStr ? parseFloat(budgetStr) : null;

  try {
    await prisma.itemRequest.create({
      data: {
        title,
        description: description || null,
        budget,
        condition: condition || null,
        categoryId,
        requesterId: session.user.id,
      },
    });
  } catch (error) {
    return { error: "Failed to create request" };
  }

  revalidatePath("/requests");
  redirect("/requests");
}

export async function updateItemRequest(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to update a request" };
  }

  const request = await prisma.itemRequest.findUnique({
    where: { id },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  if (request.requesterId !== session.user.id) {
    return { error: "You can only update your own requests" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budgetStr = formData.get("budget") as string;
  const condition = formData.get("condition") as string;
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as string;

  if (!title || title.length < 3) {
    return { fieldErrors: { title: ["Title must be at least 3 characters"] } };
  }

  const budget = budgetStr ? parseFloat(budgetStr) : null;

  try {
    await prisma.itemRequest.update({
      where: { id },
      data: {
        title,
        description: description || null,
        budget,
        condition: condition || null,
        categoryId,
        status: status || "OPEN",
      },
    });
  } catch (error) {
    return { error: "Failed to update request" };
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${id}`);
  redirect(`/requests/${id}`);
}

export async function deleteItemRequest(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to delete a request" };
  }

  const request = await prisma.itemRequest.findUnique({
    where: { id },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  if (request.requesterId !== session.user.id) {
    return { error: "You can only delete your own requests" };
  }

  try {
    await prisma.itemRequest.delete({
      where: { id },
    });
  } catch (error) {
    return { error: "Failed to delete request" };
  }

  revalidatePath("/requests");
  redirect("/requests");
}

export async function getItemRequests(options?: {
  status?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status = "OPEN", categoryId, search, page = 1, limit = 12 } = options || {};

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.itemRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.itemRequest.count({ where }),
  ]);

  return {
    requests,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getItemRequest(id: string) {
  return prisma.itemRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
          createdAt: true,
        },
      },
      category: true,
    },
  });
}

// ============ SUGGESTION ACTIONS (Public, no auth required) ============

export async function createSuggestionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budgetStr = formData.get("budget") as string;
  const condition = formData.get("condition") as string;
  const categoryId = formData.get("categoryId") as string;
  const guestName = formData.get("guestName") as string;
  const guestEmail = formData.get("guestEmail") as string;

  if (!title || title.length < 3) {
    return { fieldErrors: { title: ["Title must be at least 3 characters"] } };
  }

  if (!categoryId) {
    return { fieldErrors: { categoryId: ["Category is required"] } };
  }

  const budget = budgetStr ? parseFloat(budgetStr) : null;

  const session = await auth();

  try {
    await prisma.itemRequest.create({
      data: {
        title,
        description: description || null,
        budget,
        condition: condition || null,
        categoryId,
        requesterId: session?.user?.id || null,
        guestName: session?.user?.id ? null : guestName || null,
        guestEmail: session?.user?.id ? null : guestEmail || null,
      },
    });
  } catch (error) {
    return { error: "Failed to create suggestion" };
  }

  revalidatePath("/suggestions");
  redirect("/suggestions");
}

export async function getSuggestionsAction(options?: {
  status?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status = "OPEN", categoryId, search, page = 1, limit = 12 } = options || {};

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [suggestions, total] = await Promise.all([
    prisma.itemRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.itemRequest.count({ where }),
  ]);

  return {
    suggestions,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getSuggestionAction(id: string) {
  return prisma.itemRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
          createdAt: true,
        },
      },
      category: true,
    },
  });
}

export async function fulfillSuggestionAction(suggestionId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to fulfill a suggestion" };
  }

  const suggestion = await prisma.itemRequest.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion) {
    return { error: "Suggestion not found" };
  }

  if (suggestion.status !== "OPEN") {
    return { error: "This suggestion is no longer open" };
  }

  redirect(`/marketplace/new?fromSuggestion=${suggestionId}&title=${encodeURIComponent(suggestion.title)}&categoryId=${suggestion.categoryId}${suggestion.condition ? `&condition=${suggestion.condition}` : ""}`);
}

export async function closeSuggestionAction(id: string): Promise<ActionState> {
  const session = await auth();

  const suggestion = await prisma.itemRequest.findUnique({
    where: { id },
  });

  if (!suggestion) {
    return { error: "Suggestion not found" };
  }

  const isOwner = session?.user?.id && session.user.id === suggestion.requesterId;
  
  let isAdmin = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    isAdmin = user?.role === "ADMIN";
  }

  if (!isOwner && !isAdmin) {
    return { error: "You can only close your own suggestions" };
  }

  try {
    await prisma.itemRequest.update({
      where: { id },
      data: { status: "CLOSED" },
    });
  } catch (error) {
    return { error: "Failed to close suggestion" };
  }

  revalidatePath("/suggestions");
  revalidatePath(`/suggestions/${id}`);
  return null;
}
