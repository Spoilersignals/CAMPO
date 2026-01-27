"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get("anon_session")?.value || crypto.randomUUID();
}

export async function askQuestion(question: string, recipientCode?: string, recipientId?: string) {
  const sessionId = await getSessionId();

  const q = await prisma.anonQuestion.create({
    data: {
      question,
      senderSessionId: sessionId,
      recipientId,
      recipientCode,
    },
  });

  return { success: true, question: q };
}

export async function getMyReceivedQuestions(status?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return prisma.anonQuestion.findMany({
    where: {
      recipientId: session.user.id,
      ...(status ? { status } : {}),
    },
    include: { answer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function answerQuestion(questionId: string, content: string, isPublic = true) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const question = await prisma.anonQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question || question.recipientId !== session.user.id) {
    return { success: false, error: "Not found or not authorized" };
  }

  await prisma.$transaction([
    prisma.anonAnswer.create({
      data: { questionId, content, isPublic },
    }),
    prisma.anonQuestion.update({
      where: { id: questionId },
      data: { status: "ANSWERED" },
    }),
  ]);

  return { success: true };
}

export async function ignoreQuestion(questionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  await prisma.anonQuestion.update({
    where: { id: questionId, recipientId: session.user.id },
    data: { status: "IGNORED" },
  });

  return { success: true };
}

export async function getPublicAnswers(recipientId?: string, limit = 20) {
  return prisma.anonAnswer.findMany({
    where: {
      isPublic: true,
      ...(recipientId ? { question: { recipientId } } : {}),
    },
    include: {
      question: {
        select: { question: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
