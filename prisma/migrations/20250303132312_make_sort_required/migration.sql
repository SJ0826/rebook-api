/*
  Warnings:

  - Made the column `sort` on table `BookImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BookImage" ALTER COLUMN "sort" SET NOT NULL;
