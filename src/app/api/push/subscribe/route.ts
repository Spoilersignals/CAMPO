import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const sessionId = await getSessionId();
    const userId = session?.user?.id || null;

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return Response.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        sessionId,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        sessionId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    return Response.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionId = await getSessionId();
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return Response.json({ error: "Endpoint required" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        sessionId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return Response.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    );
  }
}
