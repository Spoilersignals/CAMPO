"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createSupportTicketAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const topic = formData.get("topic") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const phone = formData.get("phone") as string;

  if (!topic || !subject || !description) {
    return { error: "Please fill in all required fields" };
  }

  if (subject.length < 3) {
    return { error: "Subject must be at least 3 characters" };
  }

  if (description.length < 10) {
    return { error: "Please provide more details in your message" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  try {
    await prisma.supportTicket.create({
      data: {
        subject: `[${topic.toUpperCase()}] ${subject}`,
        description,
        buyerName: user?.name || "User",
        buyerPhone: phone || user?.phone || null,
        buyerEmail: user?.email || null,
        status: "OPEN",
      },
    });

    // Notify admins about new ticket
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "MESSAGE",
          title: "New Support Ticket",
          body: `${user?.name || "A user"} submitted a support request: ${subject}`,
          href: "/admin/support",
        })),
      });
    }

    revalidatePath("/admin/support");
    return { success: true };
  } catch {
    return { error: "Failed to create support ticket" };
  }
}
