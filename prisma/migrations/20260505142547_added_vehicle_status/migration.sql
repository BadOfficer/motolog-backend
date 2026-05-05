/*
  Warnings:

  - Added the required column `vehicleStatus` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'NEEDS_REVIEW');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "vehicleStatus" "VehicleStatus" NOT NULL;
