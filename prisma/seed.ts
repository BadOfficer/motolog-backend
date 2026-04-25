import { PrismaPg } from '@prisma/adapter-pg';
import { SYSTEM_CATEGORIES } from 'src/constants/system-categories';
import { PrismaClient } from 'src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: `${process.env.DATABASE_URL}`,
});
const prismaClient = new PrismaClient({ adapter });

async function main() {
  for (const category of Object.values(SYSTEM_CATEGORIES)) {
    await prismaClient.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {},
      create: {
        slug: category.slug,
        title: category.title,
        isSystem: true,
      },
    });
  }
}

main()
  .catch(async (e) => {
    console.error(e);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
