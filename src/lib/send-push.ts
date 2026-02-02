// @ts-expect-error - web-push types may not be available
import webpush from 'web-push';
import { prisma } from './prisma';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

// Initialize web-push with VAPID details
try {
  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
      'mailto:support@comradezone.com',
      vapidPublicKey,
      vapidPrivateKey
    );
  }
} catch {
  console.warn('Push notifications not configured - VAPID keys missing');
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPush(sub, payload))
  );

  const failedEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      failedEndpoints.push(subscriptions[i].endpoint);
    }
  });

  if (failedEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: failedEndpoints } }
    });
  }

  return results.filter(r => r.status === 'fulfilled').length;
}

async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify(payload)
  );
}
