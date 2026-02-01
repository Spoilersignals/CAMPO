"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { generateShareCode } from "@/lib/share-code";
import { notifyAdminsOfPendingConfession } from "@/lib/notifications";
import { moderateContent } from "@/lib/content-moderation";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Model for anonymous personal links (stored separately from users)
// We'll create a new table or use a simple approach with session-based storage

export async function generatePersonalLink(): Promise<ActionResult<{ link: string }>> {
  try {
    const sessionId = await getSessionId();

    // Check if this session already has a link
    const existingLink = await prisma.personalLink.findUnique({
      where: { sessionId },
      select: { code: true },
    });

    if (existingLink) {
      return { success: true, data: { link: existingLink.code } };
    }

    // Generate unique link
    let link: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateShareCode(8);
      const existing = await prisma.personalLink.findUnique({ where: { code } });
      if (!existing) {
        link = code;
        break;
      }
    }

    if (!link) {
      return { success: false, error: "Failed to generate unique link" };
    }

    await prisma.personalLink.create({
      data: {
        sessionId,
        code: link,
      },
    });

    revalidatePath("/confessions/my-link");
    return { success: true, data: { link } };
  } catch (error) {
    console.error("Failed to generate personal link:", error);
    return { success: false, error: "Failed to generate link" };
  }
}

export async function getMyPersonalLink(): Promise<ActionResult<{ 
  link: string | null;
  code: string | null;
  confessions: Array<{
    id: string;
    content: string;
    createdAt: Date;
    status: string;
    sharedToStories: boolean;
  }> 
}>> {
  try {
    const sessionId = await getSessionId();

    const personalLink = await prisma.personalLink.findUnique({
      where: { sessionId },
      select: { code: true, id: true },
    });

    if (!personalLink) {
      return { 
        success: true, 
        data: { 
          link: null,
          code: null,
          confessions: [],
        } 
      };
    }

    const confessions = await prisma.personalConfession.findMany({
      where: { personalLinkId: personalLink.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        status: true,
        sharedToStories: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { 
      success: true, 
      data: { 
        link: personalLink.code,
        code: personalLink.code,
        confessions,
      } 
    };
  } catch (error) {
    console.error("Failed to get personal link:", error);
    return { success: false, error: "Failed to get link" };
  }
}

export async function getPersonalLinkInfo(linkCode: string): Promise<ActionResult<{
  id: string;
  displayName: string | null;
} | null>> {
  try {
    const link = await prisma.personalLink.findUnique({
      where: { code: linkCode },
      select: {
        id: true,
        displayName: true,
      },
    });

    return { success: true, data: link };
  } catch (error) {
    console.error("Failed to get link info:", error);
    return { success: false, error: "Failed to find link" };
  }
}

export async function sendPersonalConfession(
  linkCode: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!content || content.trim().length < 10) {
      return { success: false, error: "Message must be at least 10 characters" };
    }

    if (content.length > 2000) {
      return { success: false, error: "Message must be less than 2000 characters" };
    }

    const moderationResult = moderateContent(content);
    if (!moderationResult.isAllowed) {
      return { success: false, error: moderationResult.reason };
    }

    const link = await prisma.personalLink.findUnique({
      where: { code: linkCode },
      select: { id: true },
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    const confession = await prisma.personalConfession.create({
      data: {
        content: content.trim(),
        status: "RECEIVED",
        personalLinkId: link.id,
      },
    });

    revalidatePath(`/confessions/my-link`);
    return { success: true, data: { id: confession.id } };
  } catch (error) {
    console.error("Failed to send confession:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function shareToStories(confessionId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const sessionId = await getSessionId();

    // Find the personal link for this session
    const personalLink = await prisma.personalLink.findUnique({
      where: { sessionId },
      select: { id: true },
    });

    if (!personalLink) {
      return { success: false, error: "Link not found" };
    }

    // Find the confession and verify ownership
    const personalConfession = await prisma.personalConfession.findFirst({
      where: { 
        id: confessionId,
        personalLinkId: personalLink.id,
      },
      select: { id: true, content: true, sharedToStories: true },
    });

    if (!personalConfession) {
      return { success: false, error: "Confession not found" };
    }

    if (personalConfession.sharedToStories) {
      return { success: false, error: "Already shared to stories" };
    }

    // Create a public confession for stories (pending admin approval)
    const publicConfession = await prisma.confession.create({
      data: {
        content: personalConfession.content,
        status: "PENDING",
      },
    });

    // Mark as shared
    await prisma.personalConfession.update({
      where: { id: confessionId },
      data: { sharedToStories: true },
    });

    // Notify admins
    await notifyAdminsOfPendingConfession();

    revalidatePath("/confessions/my-link");
    return { success: true, data: { id: publicConfession.id } };
  } catch (error) {
    console.error("Failed to share to stories:", error);
    return { success: false, error: "Failed to share" };
  }
}

export async function updateDisplayName(name: string): Promise<ActionResult> {
  try {
    const sessionId = await getSessionId();

    await prisma.personalLink.update({
      where: { sessionId },
      data: { displayName: name.trim() || null },
    });

    revalidatePath("/confessions/my-link");
    return { success: true };
  } catch (error) {
    console.error("Failed to update display name:", error);
    return { success: false, error: "Failed to update name" };
  }
}

export async function updatePersonalLinkCode(newCode: string): Promise<ActionResult> {
  try {
    const sessionId = await getSessionId();

    const code = newCode.toLowerCase().trim();

    if (code.length < 3 || code.length > 20) {
      return { success: false, error: "Code must be 3-20 characters" };
    }

    if (!/^[a-z0-9_]+$/.test(code)) {
      return { success: false, error: "Only lowercase letters, numbers, and underscores allowed" };
    }

    const existing = await prisma.personalLink.findUnique({
      where: { code },
      select: { sessionId: true },
    });

    if (existing && existing.sessionId !== sessionId) {
      return { success: false, error: "This code is already taken" };
    }

    await prisma.personalLink.update({
      where: { sessionId },
      data: { code },
    });

    revalidatePath("/confessions/my-link");
    return { success: true };
  } catch (error) {
    console.error("Failed to update link code:", error);
    return { success: false, error: "Failed to update code" };
  }
}
