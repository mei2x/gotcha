/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `tradingMethod` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tradingMethod" TEXT NOT NULL,
ALTER COLUMN "price" DROP NOT NULL;
