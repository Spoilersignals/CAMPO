"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/notifications");
  return { success: true };
}

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/notifications");
  return { success: true };
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) {
    return 0;
  }

  return prisma.notification.count({
    where: {
      userId: session.user.id,
      readAt: null,
    },
  });
}
