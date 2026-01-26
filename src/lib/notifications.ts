import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "MESSAGE"
  | "LISTING_APPROVED"
  | "LISTING_REJECTED"
  | "LISTING_SOLD"
  | "SUGGESTION_MATCH"
  | "ESCROW_RELEASED"
  | "ESCROW_REFUNDED"
  | "CONFESSION_PENDING"
  | "CRUSH_PENDING"
  | "SPOTTED_PENDING";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  href,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body: body || null,
      href: href || null,
    },
  });
}

export async function createNotificationsForMatchingSuggestions(
  listingId: string,
  listingTitle: string,
  categoryId: string
) {
  const matchingRequests = await prisma.itemRequest.findMany({
    where: {
      categoryId,
      status: "OPEN",
    },
    select: {
      id: true,
      requesterId: true,
      guestEmail: true,
      guestName: true,
    },
  });

  const notificationsToCreate: CreateNotificationParams[] = [];
  const guestEmailsToNotify: Array<{
    email: string;
    name: string | null;
    listingTitle: string;
    listingId: string;
  }> = [];

  for (const request of matchingRequests) {
    if (request.requesterId) {
      notificationsToCreate.push({
        userId: request.requesterId,
        type: "SUGGESTION_MATCH",
        title: "New listing matches your suggestion!",
        body: `A new listing matches your suggestion: "${listingTitle}"`,
        href: `/listings/${listingId}`,
      });
    } else if (request.guestEmail) {
      guestEmailsToNotify.push({
        email: request.guestEmail,
        name: request.guestName,
        listingTitle,
        listingId,
      });
    }
  }

  if (notificationsToCreate.length > 0) {
    await prisma.notification.createMany({
      data: notificationsToCreate.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        body: n.body || null,
        href: n.href || null,
      })),
    });
  }

  return {
    notifiedUsers: notificationsToCreate.length,
    guestEmailsToNotify,
  };
}

export async function notifyAdminsOfPendingConfession() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (admins.length === 0) {
    return { notifiedAdmins: 0 };
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "CONFESSION_PENDING",
      title: "New confession submitted for review",
      body: "A new confession has been submitted and is awaiting your approval.",
      href: "/admin/confessions",
    })),
  });

  return { notifiedAdmins: admins.length };
}

export async function notifyAdminsOfPendingCrush() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (admins.length === 0) {
    return { notifiedAdmins: 0 };
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "CRUSH_PENDING",
      title: "New crush submitted for review",
      body: "A new campus crush has been submitted and is awaiting your approval.",
      href: "/admin/crushes",
    })),
  });

  return { notifiedAdmins: admins.length };
}

export async function notifyAdminsOfPendingSpotted() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (admins.length === 0) {
    return { notifiedAdmins: 0 };
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "SPOTTED_PENDING",
      title: "New spotted submitted for review",
      body: "A new spotted post has been submitted and is awaiting your approval.",
      href: "/admin/spotted",
    })),
  });

  return { notifiedAdmins: admins.length };
}
