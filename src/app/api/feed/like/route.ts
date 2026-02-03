import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function getSessionId(): string {
  const cookieStore = cookies();
  let sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export async function POST(request: NextRequest) {
  try {
    const { postId, type } = await request.json();

    if (!postId || !type) {
      return NextResponse.json({ success: false, error: "Missing postId or type" }, { status: 400 });
    }

    const sessionId = getSessionId();
    const emoji = "❤️";

    let newLikeCount = 0;

    if (type === "confession") {
      const existingReaction = await prisma.confessionReaction.findFirst({
        where: { sessionId, confessionId: postId, emoji },
      });

      if (existingReaction) {
        await prisma.confessionReaction.delete({ where: { id: existingReaction.id } });
      } else {
        await prisma.confessionReaction.create({
          data: { confessionId: postId, sessionId, emoji },
        });
      }

      newLikeCount = await prisma.confessionReaction.count({ where: { confessionId: postId } });
    } else if (type === "crush") {
      const existingReaction = await prisma.crushReaction.findFirst({
        where: { sessionId, crushId: postId, emoji },
      });

      if (existingReaction) {
        await prisma.crushReaction.delete({ where: { id: existingReaction.id } });
      } else {
        await prisma.crushReaction.create({
          data: { crushId: postId, sessionId, emoji },
        });
      }

      newLikeCount = await prisma.crushReaction.count({ where: { crushId: postId } });
    } else if (type === "spotted") {
      const existingReaction = await prisma.spottedReaction.findFirst({
        where: { sessionId, spottedId: postId, emoji },
      });

      if (existingReaction) {
        await prisma.spottedReaction.delete({ where: { id: existingReaction.id } });
      } else {
        await prisma.spottedReaction.create({
          data: { spottedId: postId, sessionId, emoji },
        });
      }

      newLikeCount = await prisma.spottedReaction.count({ where: { spottedId: postId } });
    }

    const response = NextResponse.json({ success: true, likes: newLikeCount });
    
    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle like" }, { status: 500 });
  }
}
