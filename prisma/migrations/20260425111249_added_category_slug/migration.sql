/*
  Warnings:

  - You are about to drop the column `total` on the `service_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `service_log_categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `service_log_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_log_categories" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "service_logs" DROP COLUMN "total",
ADD COLUMN     "totalCost" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "service_log_categories_slug_key" ON "service_log_categories"("slug");
