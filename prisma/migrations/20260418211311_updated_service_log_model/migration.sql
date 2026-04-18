/*
  Warnings:

  - You are about to drop the `ServiceLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceLog" DROP CONSTRAINT "ServiceLog_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceLog" DROP CONSTRAINT "ServiceLog_vehicleId_fkey";

-- DropTable
DROP TABLE "ServiceLog";

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "log_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
