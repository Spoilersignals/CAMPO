import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  commentId?: string;
  confessionId?: string;
  crushId?: string;
  spottedId?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
  commentId,
  confessionId,
  crushId,
  spottedId,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      link,
      commentId,
      confessionId,
      crushId,
      spottedId,
    },
  });
}
