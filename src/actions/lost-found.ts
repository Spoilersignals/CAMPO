"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function createLostFoundItem(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to report an item" };
  }

  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const locationDetails = formData.get("locationDetails") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const contactName = formData.get("contactName") as string;
  const occurredAtStr = formData.get("occurredAt") as string;

  if (!type || !["LOST", "FOUND"].includes(type)) {
    return { fieldErrors: { type: ["Type must be LOST or FOUND"] } };
  }

  if (!title || title.length < 3) {
    return { fieldErrors: { title: ["Title must be at least 3 characters"] } };
  }

  if (!locationDetails || locationDetails.length < 3) {
    return { fieldErrors: { locationDetails: ["Location details are required"] } };
  }

  if (!contactPhone || contactPhone.length < 8) {
    return { fieldErrors: { contactPhone: ["Valid phone number is required"] } };
  }

  const occurredAt = occurredAtStr ? new Date(occurredAtStr) : null;

  try {
    const item = await prisma.lostFoundItem.create({
      data: {
        type,
        title,
        description: description || null,
        location: location || null,
        locationDetails,
        contactPhone,
        contactName: contactName || null,
        occurredAt,
        reporterId: session.user.id,
        status: "ACTIVE",
      },
    });

    const photoUrls = formData.getAll("photoUrls") as string[];
    if (photoUrls.length > 0) {
      await prisma.lostFoundPhoto.createMany({
        data: photoUrls.map((url, index) => ({
          url,
          sortOrder: index,
          lostFoundId: item.id,
        })),
      });
    }
  } catch (error) {
    return { error: "Failed to report item" };
  }

  revalidatePath("/lost-found");
  redirect("/lost-found");
}

export async function updateLostFoundItem(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to update an item" };
  }

  const item = await prisma.lostFoundItem.findUnique({
    where: { id },
  });

  if (!item) {
    return { error: "Item not found" };
  }

  if (item.reporterId !== session.user.id) {
    return { error: "You can only update your own items" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const locationDetails = formData.get("locationDetails") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const contactName = formData.get("contactName") as string;
  const occurredAtStr = formData.get("occurredAt") as string;
  const status = formData.get("status") as string;

  if (!title || title.length < 3) {
    return { fieldErrors: { title: ["Title must be at least 3 characters"] } };
  }

  if (!locationDetails || locationDetails.length < 3) {
    return { fieldErrors: { locationDetails: ["Location details are required"] } };
  }

  if (!contactPhone || contactPhone.length < 8) {
    return { fieldErrors: { contactPhone: ["Valid phone number is required"] } };
  }

  const occurredAt = occurredAtStr ? new Date(occurredAtStr) : null;

  try {
    await prisma.lostFoundItem.update({
      where: { id },
      data: {
        title,
        description: description || null,
        location: location || null,
        locationDetails,
        contactPhone,
        contactName: contactName || null,
        occurredAt,
        status: status || item.status,
      },
    });
  } catch (error) {
    return { error: "Failed to update item" };
  }

  revalidatePath("/lost-found");
  revalidatePath(`/lost-found/${id}`);
  redirect(`/lost-found/${id}`);
}

export async function deleteLostFoundItem(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to delete an item" };
  }

  const item = await prisma.lostFoundItem.findUnique({
    where: { id },
  });

  if (!item) {
    return { error: "Item not found" };
  }

  if (item.reporterId !== session.user.id) {
    return { error: "You can only delete your own items" };
  }

  try {
    await prisma.lostFoundItem.delete({
      where: { id },
    });
  } catch (error) {
    return { error: "Failed to delete item" };
  }

  revalidatePath("/lost-found");
  redirect("/lost-found");
}

export async function getLostFoundItems(options?: {
  type?: "LOST" | "FOUND";
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { type, status = "ACTIVE", search, page = 1, limit = 12 } = options || {};

  const where: Record<string, unknown> = {};

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { location: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.lostFoundItem.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        photos: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lostFoundItem.count({ where }),
  ]);

  return {
    items,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getLostFoundItem(id: string) {
  return prisma.lostFoundItem.findUnique({
    where: { id },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
          createdAt: true,
        },
      },
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function markAsResolved(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const item = await prisma.lostFoundItem.findUnique({
    where: { id },
  });

  if (!item) {
    return { error: "Item not found" };
  }

  if (item.reporterId !== session.user.id) {
    return { error: "You can only update your own items" };
  }

  try {
    await prisma.lostFoundItem.update({
      where: { id },
      data: { status: "RESOLVED" },
    });
  } catch (error) {
    return { error: "Failed to update item" };
  }

  revalidatePath("/lost-found");
  revalidatePath(`/lost-found/${id}`);
  return null;
}
