import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";

const router = Router();

function listingSummary(listing: {
  id: string;
  title: string;
  series: string;
  rarity: string;
  seriesIndex: number;
  seriesTotal: number;
  imageUrls: string[];
  character: { name: string; slug: string };
}) {
  return {
    id: listing.id,
    title: listing.title,
    series: listing.series,
    rarity: listing.rarity,
    seriesIndex: listing.seriesIndex,
    seriesTotal: listing.seriesTotal,
    imageUrls: listing.imageUrls,
    character: listing.character,
  };
}

function publicUser(user: { username: string; avatarUrl: string | null }) {
  return { username: user.username, avatarUrl: user.avatarUrl };
}

function serializeTradeRequest(tr: {
  id: string;
  status: string;
  createdAt: Date;
  respondedAt: Date | null;
  tradingMethod: string;
  pickupLocation: string | null;
  proposedDate: string | null;
  proposedTimes: string[];
  fromUser: { username: string; avatarUrl: string | null };
  toUser: { username: string; avatarUrl: string | null };
  fromListing: Parameters<typeof listingSummary>[0];
  toListing: Parameters<typeof listingSummary>[0];
}) {
  return {
    id: tr.id,
    status: tr.status,
    createdAt: tr.createdAt,
    respondedAt: tr.respondedAt,
    tradingMethod: tr.tradingMethod,
    pickupLocation: tr.pickupLocation,
    proposedDate: tr.proposedDate,
    proposedTimes: tr.proposedTimes,
    fromUser: publicUser(tr.fromUser),
    toUser: publicUser(tr.toUser),
    fromListing: listingSummary(tr.fromListing),
    toListing: listingSummary(tr.toListing),
  };
}

const include = {
  fromUser: true,
  toUser: true,
  fromListing: { include: { character: true } },
  toListing: { include: { character: true } },
} as const;

router.post("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { fromListingId, toListingId, pickupLocation, proposedDate, proposedTimes } =
    req.body ?? {};

  if (typeof fromListingId !== "string" || typeof toListingId !== "string") {
    res.status(400).json({ error: "Both listings are required" });
    return;
  }

  const [fromListing, toListing] = await Promise.all([
    prisma.listing.findUnique({ where: { id: fromListingId } }),
    prisma.listing.findUnique({ where: { id: toListingId } }),
  ]);

  if (!fromListing || !toListing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (fromListing.sellerId !== userId) {
    res.status(403).json({ error: "You can only offer your own listings" });
    return;
  }
  if (toListing.sellerId === userId) {
    res.status(400).json({ error: "You can't trade with your own listing" });
    return;
  }
  if (toListing.tradingMethod !== "in_person") {
    res.status(400).json({ error: "Shipping trades aren't supported yet" });
    return;
  }
  if (
    typeof pickupLocation !== "string" ||
    pickupLocation.trim().length === 0 ||
    typeof proposedDate !== "string" ||
    proposedDate.trim().length === 0 ||
    !Array.isArray(proposedTimes) ||
    proposedTimes.length === 0 ||
    !proposedTimes.every((t) => typeof t === "string")
  ) {
    res.status(400).json({ error: "Pickup location, date, and at least one time are required" });
    return;
  }

  const tradeRequest = await prisma.tradeRequest.create({
    data: {
      fromUserId: userId,
      fromListingId,
      toUserId: toListing.sellerId,
      toListingId,
      tradingMethod: toListing.tradingMethod,
      pickupLocation: pickupLocation.trim(),
      proposedDate,
      proposedTimes,
    },
    include,
  });

  res.status(201).json(serializeTradeRequest(tradeRequest));
});

router.get("/incoming", requireAuth, async (req, res) => {
  const requests = await prisma.tradeRequest.findMany({
    where: { toUserId: req.userId, status: "pending" },
    orderBy: { createdAt: "desc" },
    include,
  });
  res.json(requests.map(serializeTradeRequest));
});

router.get("/outgoing", requireAuth, async (req, res) => {
  const requests = await prisma.tradeRequest.findMany({
    where: { fromUserId: req.userId },
    orderBy: { createdAt: "desc" },
    include,
  });
  res.json(requests.map(serializeTradeRequest));
});

router.post("/:id/respond", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = String(req.params.id);
  const { action } = req.body ?? {};

  if (action !== "confirm" && action !== "decline") {
    res.status(400).json({ error: "Action must be 'confirm' or 'decline'" });
    return;
  }

  const tradeRequest = await prisma.tradeRequest.findUnique({ where: { id } });
  if (!tradeRequest) {
    res.status(404).json({ error: "Trade request not found" });
    return;
  }
  if (tradeRequest.toUserId !== userId) {
    res.status(403).json({ error: "Only the recipient can respond to this request" });
    return;
  }
  if (tradeRequest.status !== "pending") {
    res.status(409).json({ error: "This request has already been responded to" });
    return;
  }

  const updated = await prisma.tradeRequest.update({
    where: { id },
    data: {
      status: action === "confirm" ? "confirmed" : "declined",
      respondedAt: new Date(),
    },
    include,
  });

  if (action === "confirm") {
    await prisma.trade.create({
      data: {
        fromUserId: updated.fromUserId,
        fromListingId: updated.fromListing.id,
        fromTitle: updated.fromListing.title,
        fromSeries: updated.fromListing.series,
        fromImageUrls: updated.fromListing.imageUrls,
        fromCharacterName: updated.fromListing.character.name,
        fromCharacterSlug: updated.fromListing.character.slug,
        toUserId: updated.toUserId,
        toListingId: updated.toListing.id,
        toTitle: updated.toListing.title,
        toSeries: updated.toListing.series,
        toImageUrls: updated.toListing.imageUrls,
        toCharacterName: updated.toListing.character.name,
        toCharacterSlug: updated.toListing.character.slug,
      },
    });

    // The items have been exchanged — they're no longer available to trade.
    await prisma.listing.deleteMany({
      where: { id: { in: [updated.fromListing.id, updated.toListing.id] } },
    });
  }

  res.json(serializeTradeRequest(updated));
});

export default router;
