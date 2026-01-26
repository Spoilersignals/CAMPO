import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getAnonymousId(sessionId: string): string {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const num = Math.abs(hash) % 10000;
  return `Anon#${num.toString().padStart(4, "0")}`;
}

async function main() {
  const messages = await prisma.groupChatMessage.findMany({
    where: { anonymousId: "Anon#0000" },
  });

  console.log(`Found ${messages.length} messages to update`);

  for (const msg of messages) {
    const anonymousId = getAnonymousId(msg.sessionId);
    await prisma.groupChatMessage.update({
      where: { id: msg.id },
      data: { anonymousId },
    });
    console.log(`Updated message ${msg.id} with anonymousId ${anonymousId}`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
