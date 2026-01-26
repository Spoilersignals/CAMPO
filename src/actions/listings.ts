"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema, commissionPaymentSchema } from "@/lib/validators";
import { COMMISSION_RATE } from "@/lib/constants";
import { createNotificationsForMatchingSuggestions } from "@/lib/notifications";

export async function calculateCommission(price: number): Promise<number> {
  return Math.round(price * COMMISSION_RATE * 100) / 100;
}

export async function createListingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    categoryId: formData.get("categoryId") as string,
    condition: formData.get("condition") as string,
    usageDuration: formData.get("usageDuration") as string | undefined,
    deliveryMethod: formData.get("deliveryMethod") as string,
    pickupLocation: formData.get("pickupLocation") as string | undefined,
  };

  const validated = listingSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const category = await prisma.category.findUnique({
    where: { id: validated.data.categoryId },
  });

  if (!category) {
    return { error: "Invalid category" };
  }

  const images = JSON.parse((formData.get("images") as string) || "[]");

  const listing = await prisma.listing.create({
    data: {
      title: validated.data.title,
      description: validated.data.description || "",
      price: validated.data.price,
      condition: validated.data.condition,
      deliveryMethod: validated.data.deliveryMethod,
      pickupLocation: validated.data.pickupLocation || null,
      usageDuration: validated.data.usageDuration || null,
      sellerId: session.user.id,
      categoryId: category.id,
      status: "PENDING_COMMISSION",
      photos: {
        create: images.map((url: string, index: number) => ({
          url,
          sortOrder: index,
        })),
      },
    },
  });

  await createNotificationsForMatchingSuggestions(
    listing.id,
    listing.title,
    category.id
  );

  revalidatePath("/dashboard/listings");
  redirect(`/sell/commission/${listing.id}`);
}

export async function payCommissionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = {
    listingId: formData.get("listingId") as string,
  };

  const validated = commissionPaymentSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: validated.data.listingId },
    select: { id: true, sellerId: true, price: true, status: true },
  });

  if (!listing) {
    return { error: "Listing not found" };
  }

  if (listing.sellerId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  if (listing.status !== "PENDING_COMMISSION") {
    return { error: "Commission already paid or listing is not in the correct state" };
  }

  const commissionAmount = await calculateCommission(listing.price);

  await prisma.$transaction([
    prisma.commissionPayment.create({
      data: {
        amount: commissionAmount,
        status: "PAID",
        listingId: listing.id,
        sellerId: session.user.id,
        paidAt: new Date(),
      },
    }),
    prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: "PENDING_REVIEW",
        commissionPaid: true,
      },
    }),
  ]);

  revalidatePath("/dashboard/listings");
  revalidatePath(`/sell/commission/${listing.id}`);
  
  return { success: true };
}

export async function updateListingAction(listingId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true },
  });

  if (!existing || existing.sellerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (existing.status === "SOLD") {
    return { error: "Cannot edit a sold listing" };
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    categoryId: formData.get("categoryId") as string,
    condition: formData.get("condition") as string,
    usageDuration: formData.get("usageDuration") as string | undefined,
    deliveryMethod: formData.get("deliveryMethod") as string,
    pickupLocation: formData.get("pickupLocation") as string | undefined,
  };

  const validated = listingSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const category = await prisma.category.findUnique({
    where: { id: validated.data.categoryId },
  });

  if (!category) {
    return { error: "Invalid category" };
  }

  const images = JSON.parse((formData.get("images") as string) || "[]");

  await prisma.listingPhoto.deleteMany({
    where: { listingId },
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: validated.data.title,
      description: validated.data.description || "",
      price: validated.data.price,
      condition: validated.data.condition,
      deliveryMethod: validated.data.deliveryMethod,
      pickupLocation: validated.data.pickupLocation || null,
      usageDuration: validated.data.usageDuration || null,
      categoryId: category.id,
      photos: {
        create: images.map((url: string, index: number) => ({
          url,
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath("/dashboard/listings");
  revalidatePath(`/listings/${listingId}`);
  redirect(`/listings/${listingId}`);
}

export async function deleteListingAction(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true },
  });

  if (!listing || listing.sellerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (listing.status === "SOLD") {
    return { error: "Cannot delete a sold listing" };
  }

  await prisma.listing.delete({
    where: { id: listingId },
  });

  revalidatePath("/dashboard/listings");
  redirect("/dashboard/listings");
}

export async function archiveListingAction(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true },
  });

  if (!listing || listing.sellerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (listing.status === "SOLD") {
    return { error: "Cannot archive a sold listing" };
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/dashboard/listings");
  return { success: true };
}

export async function getListingWithCommission(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      category: true,
      commissionPayment: true,
    },
  });

  if (!listing || listing.sellerId !== session.user.id) {
    return null;
  }

  return {
    ...listing,
    commission: await calculateCommission(listing.price),
  };
}

export async function getSellerDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  const [
    activeListings,
    pendingCommission,
    pendingReview,
    soldListings,
    totalSalesResult,
    pendingCommissionListings,
  ] = await Promise.all([
    prisma.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
    prisma.listing.count({ where: { sellerId: userId, status: "PENDING_COMMISSION" } }),
    prisma.listing.count({ where: { sellerId: userId, status: "PENDING_REVIEW" } }),
    prisma.listing.count({ where: { sellerId: userId, status: "SOLD" } }),
    prisma.transaction.aggregate({
      where: { sellerId: userId, status: "COMPLETED" },
      _sum: { price: true },
      _count: true,
    }),
    prisma.listing.findMany({
      where: { sellerId: userId, status: "PENDING_COMMISSION" },
      include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    activeListings,
    pendingCommission,
    pendingReview,
    soldListings,
    totalSales: totalSalesResult._count || 0,
    totalEarnings: totalSalesResult._sum.price || 0,
    pendingCommissionListings,
  };
}

export async function getMyListings(status?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const where: { sellerId: string; status?: string } = {
    sellerId: session.user.id,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  return prisma.listing.findMany({
    where,
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: true,
      commissionPayment: true,
      _count: { select: { favorites: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleFavorite(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        listingId,
      },
    });
  }

  revalidatePath("/dashboard/favorites");
  revalidatePath(`/listings/${listingId}`);
}

export async function getMyFavorites() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        include: {
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
          seller: { select: { id: true, name: true, image: true, isVerified: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { parent: true },
    orderBy: { name: "asc" },
  });
}

export async function getSellerListingsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return prisma.listing.findMany({
    where: { sellerId: session.user.id },
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: true,
      commissionPayment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
