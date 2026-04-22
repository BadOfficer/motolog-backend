/*
  Warnings:

  - A unique constraint covering the columns `[correctedLogId]` on the table `service_logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoryId,date]` on the table `service_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ServiceLogStatus" AS ENUM ('ACTIVE', 'CORRECTED');

-- AlterTable
ALTER TABLE "service_logs" ADD COLUMN     "correctReason" TEXT,
ADD COLUMN     "correctedLogId" TEXT,
ADD COLUMN     "status" "ServiceLogStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "service_logs_correctedLogId_key" ON "service_logs"("correctedLogId");

-- CreateIndex
CREATE UNIQUE INDEX "service_logs_categoryId_date_key" ON "service_logs"("categoryId", "date");
