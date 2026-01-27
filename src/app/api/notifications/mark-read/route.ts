import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationId } = await request.json();

  await prisma.notification.update({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: { readAt: new Date() },
  });

  return Response.json({ success: true });
}
