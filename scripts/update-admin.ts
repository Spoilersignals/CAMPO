import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find admin user and update
  const admin = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { 
      name: 'ComradeZone Admin',
      isVerified: true 
    }
  });
  console.log(`Updated ${admin.count} admin user(s)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
