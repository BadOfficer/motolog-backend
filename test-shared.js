const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicle = await prisma.vehicle.findFirst();
  console.log('Vehicle:', vehicle);
  
  if (vehicle) {
    const shared = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
      include: {
        make: true,
        model: true,
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      }
    });
    console.log('Shared vehicle:', shared);
    console.log('isPublic:', shared.isPublic);
  }
}
main().finally(() => prisma.$disconnect());
