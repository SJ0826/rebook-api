/*
  Warnings:

  - A unique constraint covering the columns `[image_url]` on the table `BookImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookImage_image_url_key" ON "BookImage"("image_url");
