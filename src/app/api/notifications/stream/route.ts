import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  let lastCheck = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const fetchNotifications = async () => {
        try {
          const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
              where: {
                userId,
                createdAt: { gt: lastCheck },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            }),
            prisma.notification.count({
              where: {
                userId,
                readAt: null,
              },
            }),
          ]);

          if (notifications.length > 0) {
            sendEvent("notifications", { notifications, unreadCount });
          } else {
            sendEvent("count", { unreadCount });
          }

          lastCheck = new Date();
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      await fetchNotifications();

      const pollInterval = setInterval(fetchNotifications, 5000);
      const heartbeatInterval = setInterval(() => {
        sendEvent("heartbeat", { timestamp: Date.now() });
      }, 30000);

      const cleanup = () => {
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
      };

      controller.enqueue(encoder.encode(": connected\n\n"));

      return () => cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
