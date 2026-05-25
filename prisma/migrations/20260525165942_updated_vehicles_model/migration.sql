-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "isPublic" BOOLEAN DEFAULT true,
ADD COLUMN     "previousOwnerId" TEXT;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_previousOwnerId_fkey" FOREIGN KEY ("previousOwnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
