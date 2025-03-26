/*
  Warnings:

  - You are about to drop the column `saleStatus` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "saleStatus",
ADD COLUMN     "sale_status" "BookSaleStatus" NOT NULL DEFAULT 'FOR_SALE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailToken" TEXT,
ADD COLUMN     "emailTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
