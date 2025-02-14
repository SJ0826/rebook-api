/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Book` table. All the data in the column will be lost.
  - Added the required column `sellerId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_ownerId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "ownerId",
ADD COLUMN     "sellerId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
