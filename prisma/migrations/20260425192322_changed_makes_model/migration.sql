/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `makes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `makes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "makes_title_key";

-- AlterTable
ALTER TABLE "makes" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "makes_slug_key" ON "makes"("slug");
