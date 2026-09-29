/*
  Warnings:

  - You are about to drop the column `zipCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "zipCode",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT;
