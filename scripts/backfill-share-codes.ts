import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateShareCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

async function backfillShareCodes() {
  console.log("Finding approved confessions without share codes...");
  
  const confessions = await prisma.confession.findMany({
    where: {
      status: "APPROVED",
      shareCode: null,
    },
    select: { id: true },
  });

  console.log(`Found ${confessions.length} confessions to update`);

  let updated = 0;
  for (const confession of confessions) {
    let shareCode: string | null = null;
    
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateShareCode(6);
      const existing = await prisma.confession.findUnique({ where: { shareCode: code } });
      if (!existing) {
        shareCode = code;
        break;
      }
    }

    if (shareCode) {
      await prisma.confession.update({
        where: { id: confession.id },
        data: { shareCode },
      });
      updated++;
      console.log(`Updated confession ${confession.id} with share code: ${shareCode}`);
    } else {
      console.error(`Failed to generate unique share code for confession ${confession.id}`);
    }
  }

  console.log(`\nBackfill complete! Updated ${updated}/${confessions.length} confessions`);
}

backfillShareCodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
