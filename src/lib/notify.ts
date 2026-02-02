import { prisma } from './prisma';
import { sendPushToUser } from './send-push';

interface NotifyOptions {
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

export async function notify(options: NotifyOptions) {
  const notification = await prisma.notification.create({
    data: {
      userId: options.userId,
      type: options.type,
      title: options.title,
      body: options.body,
      link: options.link,
      commentId: options.commentId,
      confessionId: options.confessionId,
      crushId: options.crushId,
      spottedId: options.spottedId,
    },
  });

  sendPushToUser(options.userId, {
    title: options.title,
    body: options.body,
    url: options.link,
    tag: options.type,
  }).catch(console.error);

  return notification;
}
