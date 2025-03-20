-- CreateEnum
CREATE TYPE "BookSaleStatus" AS ENUM ('FOR_SALE', 'SOLD');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "saleStatus" "BookSaleStatus" NOT NULL DEFAULT 'FOR_SALE';
