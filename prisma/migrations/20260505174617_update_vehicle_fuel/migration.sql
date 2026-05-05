/*
  Warnings:

  - You are about to drop the column `fuelType` on the `vehicles` table. All the data in the column will be lost.
  - Added the required column `primaryFuel` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "fuelType",
ADD COLUMN     "displacement" TEXT,
ADD COLUMN     "primaryFuel" TEXT NOT NULL,
ADD COLUMN     "secondaryFuel" TEXT;
