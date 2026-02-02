import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/send-push";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Only allow admins to send test notifications
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, title, body: notificationBody, url } = body;

    if (!userId || !title || !notificationBody) {
      return Response.json(
        { error: "userId, title, and body are required" },
        { status: 400 }
      );
    }

    const successCount = await sendPushToUser(userId, {
      title,
      body: notificationBody,
      url: url || "/",
    });

    return Response.json({ success: true, sentCount: successCount });
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return Response.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
