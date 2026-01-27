"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const AVATARS = ["🦊", "🐼", "🦄", "🐉", "🦋", "🐙", "🦁", "🐺", "🦅", "🐸", "🦉", "🐯", "🦈", "🐬", "🦩"];
const ADJECTIVES = ["Mystic", "Shadow", "Cosmic", "Wild", "Silent", "Swift", "Brave", "Clever", "Dreamy", "Fierce"];
const NOUNS = ["Panda", "Phoenix", "Dragon", "Wolf", "Tiger", "Falcon", "Viper", "Raven", "Fox", "Owl"];
const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];

function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("anon_session")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export async function getOrCreatePersona() {
  const sessionId = await getSessionId();

  const existing = await prisma.anonymousPersona.findUnique({
    where: { sessionId },
  });

  if (existing) return existing;

  const persona = await prisma.anonymousPersona.create({
    data: {
      sessionId,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      alias: generateAlias(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
  });

  return persona;
}

export async function updatePersona(updates: {
  avatar?: string;
  alias?: string;
  color?: string;
}) {
  const sessionId = await getSessionId();

  const persona = await prisma.anonymousPersona.upsert({
    where: { sessionId },
    create: {
      sessionId,
      avatar: updates.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      alias: updates.alias || generateAlias(),
      color: updates.color || COLORS[Math.floor(Math.random() * COLORS.length)],
    },
    update: updates,
  });

  return persona;
}

export async function regeneratePersona() {
  const sessionId = await getSessionId();

  const persona = await prisma.anonymousPersona.upsert({
    where: { sessionId },
    create: {
      sessionId,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      alias: generateAlias(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
    update: {
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      alias: generateAlias(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
  });

  return persona;
}

export { AVATARS, COLORS };
