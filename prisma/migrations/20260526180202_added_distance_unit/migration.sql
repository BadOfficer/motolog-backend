-- CreateEnum
CREATE TYPE "DistanceUnit" AS ENUM ('KM', 'MI');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "distanceUnit" "DistanceUnit" NOT NULL DEFAULT 'KM';
