/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `makes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "makes" ALTER COLUMN "externalId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" INTEGER,
    "makeId" TEXT NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "models_externalId_key" ON "models"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "models_name_makeId_key" ON "models"("name", "makeId");

-- CreateIndex
CREATE UNIQUE INDEX "makes_title_key" ON "makes"("title");

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "makes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
