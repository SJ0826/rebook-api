/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `BookImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookImage_uuid_key" ON "BookImage"("uuid");
