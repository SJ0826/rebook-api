/*
  Warnings:

  - You are about to drop the column `emailToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailTokenExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailToken",
DROP COLUMN "emailTokenExpiry",
DROP COLUMN "emailVerified",
ADD COLUMN     "email_token" TEXT,
ADD COLUMN     "email_token_expiry" TIMESTAMP(3),
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;
