/*
  Warnings:

  - You are about to drop the column `totalCost` on the `service_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "service_logs" DROP COLUMN "totalCost",
ADD COLUMN     "subTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "description" TEXT,
    "partNumber" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "serviceLogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parts_name_key" ON "parts"("name");

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_serviceLogId_fkey" FOREIGN KEY ("serviceLogId") REFERENCES "service_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
