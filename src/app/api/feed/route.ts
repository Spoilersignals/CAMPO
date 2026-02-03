import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

function getSessionId(): string {
  const cookieStore = cookies();
  return cookieStore.get("session_id")?.value || "";
}

async function checkIsAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  
  return user?.role === "ADMIN";
}

export async function GET() {
  try {
    const sessionId = getSessionId();
    const isAdmin = await checkIsAdmin();

    const [confessions, crushes, spotted] = await Promise.all([
      prisma.confession.findMany({
        where: { status: "APPROVED" },
        include: {
          _count: { select: { reactions: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.campusCrush.findMany({
        where: { status: "APPROVED" },
        include: {
          _count: { select: { reactions: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.spotted.findMany({
        where: { status: "APPROVED" },
        include: {
          _count: { select: { reactions: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Check likes for each post if we have a session
    let confessionLikes: Set<string> = new Set();
    let crushLikes: Set<string> = new Set();
    let spottedLikes: Set<string> = new Set();

    if (sessionId) {
      const [confReactions, crushReactions, spottedReactions] = await Promise.all([
        prisma.confessionReaction.findMany({
          where: { sessionId, confessionId: { in: confessions.map(c => c.id) } },
          select: { confessionId: true },
        }),
        prisma.crushReaction.findMany({
          where: { sessionId, crushId: { in: crushes.map(c => c.id) } },
          select: { crushId: true },
        }),
        prisma.spottedReaction.findMany({
          where: { sessionId, spottedId: { in: spotted.map(s => s.id) } },
          select: { spottedId: true },
        }),
      ]);

      confReactions.forEach(r => confessionLikes.add(r.confessionId));
      crushReactions.forEach(r => crushLikes.add(r.crushId));
      spottedReactions.forEach(r => spottedLikes.add(r.spottedId));
    }

    const posts = [
      ...confessions.map((c) => ({
        id: c.id,
        type: "confession" as const,
        content: c.content,
        author: `Confession #${c.confessionNumber || "?"}`,
        isVerified: false,
        createdAt: c.createdAt,
        likes: c._count.reactions,
        comments: c._count.comments,
        shares: 0,
        hasLiked: confessionLikes.has(c.id),
      })),
      ...crushes.map((c) => ({
        id: c.id,
        type: "crush" as const,
        content: c.description,
        author: "Campus Crush",
        isVerified: false,
        createdAt: c.createdAt,
        likes: c._count.reactions,
        comments: c._count.comments,
        shares: 0,
        hasLiked: crushLikes.has(c.id),
      })),
      ...spotted.map((s) => ({
        id: s.id,
        type: "spotted" as const,
        content: s.content,
        author: "Spotted",
        isVerified: false,
        createdAt: s.createdAt,
        likes: s._count.reactions,
        comments: s._count.comments,
        shares: 0,
        hasLiked: spottedLikes.has(s.id),
      })),
    ];

    // Sort: verified users first, then by createdAt descending within each group
    posts.sort((a, b) => {
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ posts: posts.slice(0, 15), isAdmin });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ posts: [], isAdmin: false });
  }
}
