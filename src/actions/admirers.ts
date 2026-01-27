"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get("anon_session")?.value || crypto.randomUUID();
}

export async function sendAdmiration(targetCode: string, message?: string) {
  const sessionId = await getSessionId();

  const existing = await prisma.secretAdmirer.findUnique({
    where: { sessionId_targetCode: { sessionId, targetCode } },
  });

  if (existing) {
    return { success: false, error: "Already sent admiration" };
  }

  await prisma.secretAdmirer.create({
    data: {
      sessionId,
      targetCode,
      message,
    },
  });

  return { success: true };
}

export async function getAdmirerCount(targetCode: string) {
  return prisma.secretAdmirer.count({
    where: { targetCode, revealed: false },
  });
}

export async function getMyAdmirers(targetCode: string) {
  return prisma.secretAdmirer.findMany({
    where: { targetCode },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      message: true,
      revealed: true,
      createdAt: true,
    },
  });
}

export async function revealAdmirer(admirerId: string, targetCode: string) {
  const admirer = await prisma.secretAdmirer.findFirst({
    where: { id: admirerId, targetCode },
  });

  if (!admirer) {
    return { success: false, error: "Not found" };
  }

  await prisma.secretAdmirer.update({
    where: { id: admirerId },
    data: { revealed: true },
  });

  return { success: true, sessionId: admirer.sessionId };
}

export async function hasAdmired(targetCode: string) {
  const sessionId = await getSessionId();
  const admirer = await prisma.secretAdmirer.findUnique({
    where: { sessionId_targetCode: { sessionId, targetCode } },
  });
  return !!admirer;
}
