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

export async function getAdminStats() {
  await requireAdmin();
  
  const [
    totalListings,
    pendingReviews,
    pendingLostFound,
    openTickets,
    commissionPayments,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.lostFoundItem.count({ where: { status: "ACTIVE" } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.commissionPayment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);
  
  return {
    totalListings,
    pendingReviews,
    pendingLostFound,
    openTickets,
    commissionEarned: commissionPayments._sum.amount || 0,
  };
}

export async function getRecentActivity() {
  await requireAdmin();
  
  const [recentListings, recentTickets] = await Promise.all([
    prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { id: true, name: true } },
      },
    }),
    prisma.supportTicket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  
  return {
    recentListings,
    recentTickets,
  };
}

export async function approveListingAction(listingId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listingId },
      data: { status: "ACTIVE" },
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

export async function rejectListingAction(listingId: string, reason: string) {
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
        notes: reason,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/listings");
  return { success: true };
}

// Escrow actions commented out - buyers now pay sellers directly via M-Pesa or bank transfer
// Keeping for future M-Pesa integration
// export async function releaseEscrowAction(escrowId: string) { ... }
// export async function refundEscrowAction(escrowId: string) { ... }

export async function resolveTicketAction(ticketId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "RESOLVED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "SUPPORT_TICKET",
        targetId: ticketId,
        notes: "Ticket resolved",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/support");
  return { success: true };
}

export async function updateSupportTicketAction(
  ticketId: string,
  status: string
) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "SUPPORT_TICKET",
        targetId: ticketId,
        notes: `Status updated to ${status}`,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/support");
  return { success: true };
}

export async function approveUserAction(userId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { sellerApproved: true },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "USER",
        targetId: userId,
        notes: "Seller approved",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/users");
  return { success: true };
}

export async function banUserAction(userId: string, reason?: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { sellerApproved: false },
    }),
    prisma.moderationLog.create({
      data: {
        action: "BAN",
        targetType: "USER",
        targetId: userId,
        notes: reason || "User banned",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/users");
  return { success: true };
}

export async function sendModeratorMessage(
  threadId: string,
  message: string
) {
  const adminId = await requireAdmin();
  
  await prisma.chatMessage.create({
    data: {
      threadId,
      body: message,
      senderId: adminId,
      senderName: "Moderator",
    },
  });
  
  revalidatePath(`/admin/conversations/${threadId}`);
  return { success: true };
}

export async function releaseEscrowAction(escrowId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { status: "RELEASED", releasedAt: new Date() },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "ESCROW",
        targetId: escrowId,
        notes: "Escrow released to seller",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/escrow");
  return { success: true };
}

export async function refundEscrowAction(escrowId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { status: "REFUNDED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "REJECT",
        targetType: "ESCROW",
        targetId: escrowId,
        notes: "Escrow refunded to buyer",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/escrow");
  return { success: true };
}

// ============ CONFESSIONS ============

export async function getPendingConfessions() {
  await requireAdmin();
  
  return prisma.confession.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveConfessionAction(confessionId: string) {
  const adminId = await requireAdmin();
  
  // Get the next confession number
  const lastConfession = await prisma.confession.findFirst({
    where: { confessionNumber: { not: null } },
    orderBy: { confessionNumber: "desc" },
    select: { confessionNumber: true },
  });
  
  const nextNumber = (lastConfession?.confessionNumber || 0) + 1;
  
  // Generate unique share code with retry
  const { generateShareCode } = await import("@/lib/share-code");
  let shareCode: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShareCode(6);
    const existing = await prisma.confession.findUnique({ where: { shareCode: code } });
    if (!existing) {
      shareCode = code;
      break;
    }
  }
  
  // Set story expiry to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  await prisma.$transaction([
    prisma.confession.update({
      where: { id: confessionId },
      data: { 
        status: "APPROVED", 
        confessionNumber: nextNumber,
        shareCode,
        approvedAt: new Date(),
        expiresAt,
      },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "CONFESSION",
        targetId: confessionId,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/confessions");
  revalidatePath("/confessions");
  return { success: true };
}

export async function rejectConfessionAction(confessionId: string, reason?: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.confession.update({
      where: { id: confessionId },
      data: { 
        status: "REJECTED",
        rejectionReason: reason,
      },
    }),
    prisma.moderationLog.create({
      data: {
        action: "REJECT",
        targetType: "CONFESSION",
        targetId: confessionId,
        notes: reason,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/confessions");
  return { success: true };
}

// ============ CAMPUS CRUSHES ============

export async function getPendingCrushes() {
  await requireAdmin();
  
  return prisma.campusCrush.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveCrushAction(crushId: string) {
  const adminId = await requireAdmin();
  
  const lastCrush = await prisma.campusCrush.findFirst({
    where: { crushNumber: { not: null } },
    orderBy: { crushNumber: "desc" },
    select: { crushNumber: true },
  });
  
  const nextNumber = (lastCrush?.crushNumber || 0) + 1;
  
  await prisma.$transaction([
    prisma.campusCrush.update({
      where: { id: crushId },
      data: { 
        status: "APPROVED", 
        crushNumber: nextNumber,
        approvedAt: new Date(),
      },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "CAMPUS_CRUSH",
        targetId: crushId,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/crushes");
  revalidatePath("/crushes");
  return { success: true };
}

export async function rejectCrushAction(crushId: string, reason?: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.campusCrush.update({
      where: { id: crushId },
      data: { status: "REJECTED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "REJECT",
        targetType: "CAMPUS_CRUSH",
        targetId: crushId,
        notes: reason,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/crushes");
  return { success: true };
}

// ============ SPOTTED ============

export async function getPendingSpotted() {
  await requireAdmin();
  
  return prisma.spotted.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveSpottedAction(spottedId: string) {
  const adminId = await requireAdmin();
  
  const lastSpotted = await prisma.spotted.findFirst({
    where: { spottedNumber: { not: null } },
    orderBy: { spottedNumber: "desc" },
    select: { spottedNumber: true },
  });
  
  const nextNumber = (lastSpotted?.spottedNumber || 0) + 1;
  
  await prisma.$transaction([
    prisma.spotted.update({
      where: { id: spottedId },
      data: { 
        status: "APPROVED", 
        spottedNumber: nextNumber,
        approvedAt: new Date(),
      },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "SPOTTED",
        targetId: spottedId,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/spotted");
  revalidatePath("/spotted");
  return { success: true };
}

export async function rejectSpottedAction(spottedId: string, reason?: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.spotted.update({
      where: { id: spottedId },
      data: { status: "REJECTED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "REJECT",
        targetType: "SPOTTED",
        targetId: spottedId,
        notes: reason,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/spotted");
  return { success: true };
}

// ============ POLLS ============

export async function getPendingPolls() {
  await requireAdmin();
  
  return prisma.poll.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      options: true,
    },
  });
}

export async function approvePollAction(pollId: string) {
  const adminId = await requireAdmin();
  
  const lastPoll = await prisma.poll.findFirst({
    where: { pollNumber: { not: null } },
    orderBy: { pollNumber: "desc" },
    select: { pollNumber: true },
  });
  
  const nextNumber = (lastPoll?.pollNumber || 0) + 1;
  
  await prisma.$transaction([
    prisma.poll.update({
      where: { id: pollId },
      data: { 
        status: "ACTIVE", 
        pollNumber: nextNumber,
        approvedAt: new Date(),
      },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "POLL",
        targetId: pollId,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/polls");
  revalidatePath("/polls");
  return { success: true };
}

export async function rejectPollAction(pollId: string, reason?: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.poll.update({
      where: { id: pollId },
      data: { status: "REJECTED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "REJECT",
        targetType: "POLL",
        targetId: pollId,
        notes: reason,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/polls");
  return { success: true };
}

export async function closePollAction(pollId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.poll.update({
      where: { id: pollId },
      data: { status: "CLOSED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "POLL",
        targetId: pollId,
        notes: "Poll closed",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/polls");
  revalidatePath("/polls");
  return { success: true };
}

// ============ EVENTS ============

export async function getPendingEvents() {
  await requireAdmin();
  
  return prisma.campusEvent.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function approveEventAction(eventId: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.campusEvent.update({
      where: { id: eventId },
      data: { status: "APPROVED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "CAMPUS_EVENT",
        targetId: eventId,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

export async function rejectEventAction(eventId: string, reason?: string) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.campusEvent.update({
      where: { id: eventId },
      data: { status: "REJECTED" },
    }),
    prisma.moderationLog.create({
      data: {
        action: "REJECT",
        targetType: "CAMPUS_EVENT",
        targetId: eventId,
        notes: reason,
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/events");
  return { success: true };
}

export async function featureEventAction(eventId: string, featured: boolean) {
  const adminId = await requireAdmin();
  
  await prisma.$transaction([
    prisma.campusEvent.update({
      where: { id: eventId },
      data: { isFeatured: featured },
    }),
    prisma.moderationLog.create({
      data: {
        action: "APPROVE",
        targetType: "CAMPUS_EVENT",
        targetId: eventId,
        notes: featured ? "Event featured" : "Event unfeatured",
        adminId,
      },
    }),
  ]);
  
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

// ============ SOCIAL STATS ============

export async function getSocialStats() {
  await requireAdmin();
  
  const [
    pendingConfessions,
    pendingCrushes,
    pendingSpotted,
    pendingPolls,
    pendingEvents,
    totalConfessions,
    totalCrushes,
    totalSpotted,
    totalPolls,
    totalEvents,
    groupMessages,
  ] = await Promise.all([
    prisma.confession.count({ where: { status: "PENDING" } }),
    prisma.campusCrush.count({ where: { status: "PENDING" } }),
    prisma.spotted.count({ where: { status: "PENDING" } }),
    prisma.poll.count({ where: { status: "PENDING" } }),
    prisma.campusEvent.count({ where: { status: "PENDING" } }),
    prisma.confession.count({ where: { status: "APPROVED" } }),
    prisma.campusCrush.count({ where: { status: "APPROVED" } }),
    prisma.spotted.count({ where: { status: "APPROVED" } }),
    prisma.poll.count({ where: { status: "ACTIVE" } }),
    prisma.campusEvent.count({ where: { status: "APPROVED" } }),
    prisma.groupChatMessage.count({ where: { isDeleted: false } }),
  ]);
  
  return {
    pending: {
      confessions: pendingConfessions,
      crushes: pendingCrushes,
      spotted: pendingSpotted,
      polls: pendingPolls,
      events: pendingEvents,
      total: pendingConfessions + pendingCrushes + pendingSpotted + pendingPolls + pendingEvents,
    },
    approved: {
      confessions: totalConfessions,
      crushes: totalCrushes,
      spotted: totalSpotted,
      polls: totalPolls,
      events: totalEvents,
    },
    groupMessages,
  };
}
