/*
  Warnings:

  - A unique constraint covering the columns `[sort]` on the table `BookImage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BookImage" ADD COLUMN     "sort" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "BookImage_sort_key" ON "BookImage"("sort");
