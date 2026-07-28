-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_fromListingId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_toListingId_fkey";

-- DropForeignKey
ALTER TABLE "TradeRequest" DROP CONSTRAINT "TradeRequest_fromListingId_fkey";

-- DropForeignKey
ALTER TABLE "TradeRequest" DROP CONSTRAINT "TradeRequest_toListingId_fkey";

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_fromListingId_fkey" FOREIGN KEY ("fromListingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_toListingId_fkey" FOREIGN KEY ("toListingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_fromListingId_fkey" FOREIGN KEY ("fromListingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_toListingId_fkey" FOREIGN KEY ("toListingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
