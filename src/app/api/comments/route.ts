import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function getSessionId() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get("comment_session")?.value;
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("type") as "confession" | "crush" | "spotted" | "poll";
    const contentId = searchParams.get("id");

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    let comments: Array<{
      id: string;
      content: string;
      authorName: string | null;
      createdAt: Date;
      parentId?: string | null;
    }> = [];

    switch (contentType) {
      case "confession":
        comments = await prisma.confessionComment.findMany({
          where: { confessionId: contentId },
          orderBy: { createdAt: "asc" },
        });
        break;
      case "crush":
        comments = await prisma.crushComment.findMany({
          where: { crushId: contentId },
          orderBy: { createdAt: "asc" },
        });
        break;
      case "spotted":
        comments = await prisma.spottedComment.findMany({
          where: { spottedId: contentId },
          orderBy: { createdAt: "asc" },
        });
        break;
      case "poll":
        comments = await prisma.pollComment.findMany({
          where: { pollId: contentId },
          orderBy: { createdAt: "asc" },
        });
        break;
    }

    const formattedComments = comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorName: c.authorName,
      createdAt: c.createdAt,
      reactions: [],
      userReactions: [],
      parentId: c.parentId || null,
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, contentId, content, authorName, parentId } = body;

    if (!contentType || !contentId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let comment;

    switch (contentType) {
      case "confession":
        comment = await prisma.confessionComment.create({
          data: {
            confessionId: contentId,
            content: content.trim(),
            authorName: authorName?.trim() || null,
          },
        });
        break;
      case "crush":
        comment = await prisma.crushComment.create({
          data: {
            crushId: contentId,
            content: content.trim(),
            authorName: authorName?.trim() || null,
          },
        });
        break;
      case "spotted":
        comment = await prisma.spottedComment.create({
          data: {
            spottedId: contentId,
            content: content.trim(),
            authorName: authorName?.trim() || null,
          },
        });
        break;
      case "poll":
        comment = await prisma.pollComment.create({
          data: {
            pollId: contentId,
            content: content.trim(),
            authorName: authorName?.trim() || null,
          },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        authorName: comment.authorName,
        createdAt: comment.createdAt,
        reactions: [],
        userReactions: [],
      },
    });

    const sessionId = getSessionId();
    response.cookies.set("comment_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
