import { PrismaClient } from "@prisma/client";

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

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log("Seeded categories:", categories.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
