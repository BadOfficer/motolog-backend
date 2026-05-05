-- DropForeignKey
ALTER TABLE "models" DROP CONSTRAINT "models_makeId_fkey";

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "makes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
