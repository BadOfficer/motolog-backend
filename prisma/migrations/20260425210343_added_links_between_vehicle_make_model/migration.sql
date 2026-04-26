/*
  Warnings:

  - You are about to drop the column `make` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `vehicles` table. All the data in the column will be lost.
  - Added the required column `makeId` to the `vehicles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelId` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "make",
DROP COLUMN "model",
ADD COLUMN     "makeId" TEXT NOT NULL,
ADD COLUMN     "modelId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "makes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
