-- CreateEnum
CREATE TYPE "TradeRequestStatus" AS ENUM ('pending', 'confirmed', 'declined');

-- CreateTable
CREATE TABLE "TradeRequest" (
    "id" TEXT NOT NULL,
    "status" "TradeRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "tradingMethod" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "proposedDate" TEXT,
    "proposedTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fromUserId" TEXT NOT NULL,
    "fromListingId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "toListingId" TEXT NOT NULL,

    CONSTRAINT "TradeRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_fromListingId_fkey" FOREIGN KEY ("fromListingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_toListingId_fkey" FOREIGN KEY ("toListingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
