import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Textbooks", slug: "textbooks" },
  { name: "Electronics", slug: "electronics" },
  { name: "Furniture", slug: "furniture" },
  { name: "Clothing", slug: "clothing" },
  { name: "Sports", slug: "sports" },
  { name: "Music", slug: "music" },
  { name: "Art", slug: "art" },
  { name: "Kitchen", slug: "kitchen" },
  { name: "Transportation", slug: "transportation" },
  { name: "Services", slug: "services" },
  { name: "Housing", slug: "housing" },
  { name: "Other", slug: "other" },
];

async function main() {
  console.log("Seeding database...");

  // Seed categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log("Seeded categories:", categories.length);

  // Create admin user
  const adminEmail = "bnyolei@kabarak.ac.ke";
  const adminPassword = await hash("Zasa1898@!??", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      isVerified: true,
      emailVerified: new Date(),
    },
    create: {
      email: adminEmail,
      name: "KabuConfession",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
      emailVerified: new Date(),
      schoolName: "Kabarak University",
      sellerApproved: true,
      confessionLink: "kabuconfession",
    },
  });
  console.log("Admin user created/updated:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
