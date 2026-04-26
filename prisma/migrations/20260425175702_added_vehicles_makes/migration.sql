-- CreateTable
CREATE TABLE "makes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,

    CONSTRAINT "makes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "makes_externalId_key" ON "makes"("externalId");
