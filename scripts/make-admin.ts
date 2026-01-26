import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@campus.com";
  const password = process.argv[3] || "admin123";

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", password: hashedPassword },
    create: {
      email,
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
      sellerApproved: true,
      isVerified: true,
    },
  });

  console.log(`Admin user created/updated: ${user.email} (role: ${user.role})`);
  console.log(`Login with: ${email} / ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
