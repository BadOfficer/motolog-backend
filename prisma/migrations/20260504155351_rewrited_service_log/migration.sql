/*
  Warnings:

  - You are about to drop the column `media` on the `service_logs` table. All the data in the column will be lost.
  - You are about to drop the `parts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "parts" DROP CONSTRAINT "parts_serviceLogId_fkey";

-- AlterTable
ALTER TABLE "service_logs" DROP COLUMN "media",
ADD COLUMN     "isMileageValid" BOOLEAN DEFAULT false,
ADD COLUMN     "mileageWarnings" TEXT[];

-- DropTable
DROP TABLE "parts";

-- CreateTable
CREATE TABLE "service_logs_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "description" TEXT,
    "partNumber" TEXT,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "serviceLogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_logs_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servce_logs_media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "serviceLogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servce_logs_media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_logs_items" ADD CONSTRAINT "service_logs_items_serviceLogId_fkey" FOREIGN KEY ("serviceLogId") REFERENCES "service_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servce_logs_media" ADD CONSTRAINT "servce_logs_media_serviceLogId_fkey" FOREIGN KEY ("serviceLogId") REFERENCES "service_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
