"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  
  if (user?.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  
  return session.user.id;
}

export async function getPendingListings() {
  await requireAdmin();
  
  return prisma.listing.findMany({
    where: { status: "PENDING" },
    include: {
      seller: { select: { id: true, name: true, email: true, image: true, phone: true } },
      photos: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveListing(listingId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: "ACTIVE",
        isApproved: true,
      },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "LISTING",
        targetId: listingId,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/listings");
  return { success: true };
}

export async function rejectListing(listingId: string, reason?: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listingId },
      data: { status: "REJECTED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "REJECT",
        targetType: "LISTING",
        targetId: listingId,
        notes: reason || "Rejected by admin",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/listings");
  return { success: true };
}
