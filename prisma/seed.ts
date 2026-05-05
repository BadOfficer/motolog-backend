import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';
import { SYSTEM_CATEGORIES } from 'src/constants/system-categories';
import { PrismaClient, Role } from 'src/generated/prisma/client';
import { getSlug } from 'src/helpers/getSlug';
import { MakeApiResponse } from 'src/modules/vehicles-makes/interfaces/make-api-response.interface';

import * as bcrypt from 'bcrypt';

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

  const hashedAdminPassword = await bcrypt.hash('Admin1234', 10);

  await prismaClient.user.upsert({
    where: {
      email: 'admin@admin.com',
    },
    update: {
      email: 'admin@admin.com',
      password: hashedAdminPassword,
      role: Role.ADMIN,
      firstName: 'Taras',
      lastName: 'Bondarenko',
    },
    create: {
      email: 'admin@admin.com',
      password: 'Admin1234',
      role: Role.ADMIN,
      firstName: 'Taras',
      lastName: 'Bondarenko',
    },
  });

  try {
    const { data: makes } = await axios.get<MakeApiResponse>(
      `${process.env['VIN_API_BASE_URL']}/GetMakesForVehicleType/car?format=json`,
    );

    for (const make of makes.Results) {
      await prismaClient.make.upsert({
        where: {
          externalId: make.MakeId,
        },
        update: {
          title: make.MakeName,
        },
        create: {
          title: make.MakeName,
          externalId: make.MakeId,
          slug: getSlug(make.MakeName),
        },
      });
    }
  } catch (e: any) {
    throw new Error(e);
  }
}

main()
  .catch(async (e) => {
    console.error(e);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
