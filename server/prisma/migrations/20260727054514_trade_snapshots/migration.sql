/*
  Warnings:

  - Added the required column `fromCharacterName` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromCharacterSlug` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromSeries` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromTitle` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCharacterName` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCharacterSlug` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toSeries` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toTitle` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_fromListingId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_toListingId_fkey";

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "fromCharacterName" TEXT NOT NULL,
ADD COLUMN     "fromCharacterSlug" TEXT NOT NULL,
ADD COLUMN     "fromImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "fromSeries" TEXT NOT NULL,
ADD COLUMN     "fromTitle" TEXT NOT NULL,
ADD COLUMN     "toCharacterName" TEXT NOT NULL,
ADD COLUMN     "toCharacterSlug" TEXT NOT NULL,
ADD COLUMN     "toImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "toSeries" TEXT NOT NULL,
ADD COLUMN     "toTitle" TEXT NOT NULL,
ALTER COLUMN "fromListingId" DROP NOT NULL,
ALTER COLUMN "toListingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_fromListingId_fkey" FOREIGN KEY ("fromListingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_toListingId_fkey" FOREIGN KEY ("toListingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
