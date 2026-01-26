"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { auth } from "@/lib/auth";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function savePushSubscription(subscription: PushSubscriptionData) {
  const sessionId = await getSessionId();
  const session = await auth();
  const userId = session?.user?.id || null;

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId,
        sessionId,
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId,
        sessionId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}

export async function removePushSubscription(endpoint: string) {
  const sessionId = await getSessionId();

  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        sessionId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return { success: false, error: "Failed to remove subscription" };
  }
}
