import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  
  if (user?.role !== "ADMIN") {
    return null;
  }
  
  return session.user.id;
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { postId, type } = await request.json();

    if (!postId || !type) {
      return NextResponse.json({ success: false, error: "Missing postId or type" }, { status: 400 });
    }

    if (type === "confession") {
      await prisma.$transaction([
        prisma.confessionReaction.deleteMany({ where: { confessionId: postId } }),
        prisma.confessionComment.deleteMany({ where: { confessionId: postId } }),
        prisma.confession.delete({ where: { id: postId } }),
        prisma.moderationLog.create({
          data: {
            action: "DELETE",
            targetType: "CONFESSION",
            targetId: postId,
            adminId,
            notes: "Deleted via feed",
          },
        }),
      ]);
    } else if (type === "crush") {
      await prisma.$transaction([
        prisma.crushReaction.deleteMany({ where: { crushId: postId } }),
        prisma.crushComment.deleteMany({ where: { crushId: postId } }),
        prisma.campusCrush.delete({ where: { id: postId } }),
        prisma.moderationLog.create({
          data: {
            action: "DELETE",
            targetType: "CAMPUS_CRUSH",
            targetId: postId,
            adminId,
            notes: "Deleted via feed",
          },
        }),
      ]);
    } else if (type === "spotted") {
      await prisma.$transaction([
        prisma.spottedReaction.deleteMany({ where: { spottedId: postId } }),
        prisma.spottedComment.deleteMany({ where: { spottedId: postId } }),
        prisma.spotted.delete({ where: { id: postId } }),
        prisma.moderationLog.create({
          data: {
            action: "DELETE",
            targetType: "SPOTTED",
            targetId: postId,
            adminId,
            notes: "Deleted via feed",
          },
        }),
      ]);
    } else {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 });
  }
}
