import { Router } from "express";
import { prisma } from "../prisma";
import { getUserIdFromRequest, requireAuth } from "../auth";
import { uploadListingImages } from "../upload";
import type { Prisma, Rarity } from "../generated/prisma/client";

const router = Router();

const RARITY_ORDER: Record<string, number> = {
  ultra_rare: 0,
  rare: 1,
  semi_rare: 2,
  common: 3,
};

const RARITIES = new Set(["common", "semi_rare", "rare", "ultra_rare"]);
const TRADING_METHODS = new Set(["shipping", "in_person"]);

export function serializeListing(
  listing: {
    id: string;
    title: string;
    series: string;
    rarity: string;
    price: unknown;
    seriesIndex: number;
    seriesTotal: number;
    tradeWithUsername: string | null;
    imageUrls: string[];
    tradingMethod: string;
    seller: { username: string };
    character: { name: string; slug: string };
    _count: { likes: number };
  },
  likedByMe: boolean
) {
  return {
    id: listing.id,
    title: listing.title,
    series: listing.series,
    rarity: listing.rarity,
    price: listing.price,
    seriesIndex: listing.seriesIndex,
    seriesTotal: listing.seriesTotal,
    tradeWithUsername: listing.tradeWithUsername,
    imageUrls: listing.imageUrls,
    tradingMethod: listing.tradingMethod,
    likesCount: listing._count.likes,
    likedByMe,
    seller: { username: listing.seller.username },
    character: { name: listing.character.name, slug: listing.character.slug },
  };
}

router.get("/", async (req, res) => {
  const { sort, characters, priceMin, priceMax } = req.query;
  const userId = getUserIdFromRequest(req);

  const where: Prisma.ListingWhereInput = {};

  if (userId) {
    where.sellerId = { not: userId };
  }

  if (typeof characters === "string" && characters.length > 0) {
    where.character = { slug: { in: characters.split(",") } };
  }

  if (priceMin || priceMax) {
    where.price = {
      ...(priceMin ? { gte: Number(priceMin) } : {}),
      ...(priceMax ? { lte: Number(priceMax) } : {}),
    };
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    include: { seller: true, character: true, _count: { select: { likes: true } } },
  });

  const result =
    sort === "rare_to_common" || sort === "common_to_rare"
      ? [...listings].sort((a, b) => {
          const diff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
          return sort === "common_to_rare" ? -diff : diff;
        })
      : listings;

  const likedListingIds = userId
    ? new Set(
        (
          await prisma.like.findMany({
            where: { userId, listingId: { in: result.map((l) => l.id) } },
            select: { listingId: true },
          })
        ).map((like) => like.listingId)
      )
    : new Set<string>();

  res.json(result.map((listing) => serializeListing(listing, likedListingIds.has(listing.id))));
});

router.get("/mine", requireAuth, async (req, res) => {
  const userId = req.userId!;

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    include: { seller: true, character: true, _count: { select: { likes: true } } },
  });

  res.json(listings.map((listing) => serializeListing(listing, false)));
});

router.post("/", requireAuth, uploadListingImages.array("images", 6), async (req, res) => {
  const { title, series, characterId, seriesIndex, seriesTotal, rarity, tradingMethod } =
    req.body ?? {};

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Brand is required" });
    return;
  }
  if (typeof series !== "string" || series.trim().length === 0) {
    res.status(400).json({ error: "Series is required" });
    return;
  }
  if (typeof characterId !== "string" || characterId.length === 0) {
    res.status(400).json({ error: "Character is required" });
    return;
  }
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) {
    res.status(400).json({ error: "Unknown character" });
    return;
  }
  if (typeof rarity !== "string" || !RARITIES.has(rarity)) {
    res.status(400).json({ error: "Invalid rarity" });
    return;
  }
  if (typeof tradingMethod !== "string" || !TRADING_METHODS.has(tradingMethod)) {
    res.status(400).json({ error: "Trading method must be 'shipping' or 'in_person'" });
    return;
  }
  const seriesIndexNum = Number(seriesIndex);
  const seriesTotalNum = Number(seriesTotal);
  if (
    !Number.isInteger(seriesIndexNum) ||
    !Number.isInteger(seriesTotalNum) ||
    seriesIndexNum < 1 ||
    seriesTotalNum < 1 ||
    seriesIndexNum > seriesTotalNum
  ) {
    res.status(400).json({ error: "Rarity fraction must be valid numbers (e.g. 15 / 23)" });
    return;
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const imageUrls = files.map((file) => `/uploads/${file.filename}`);

  const listing = await prisma.listing.create({
    data: {
      title: title.trim(),
      series: series.trim(),
      rarity: rarity as Rarity,
      seriesIndex: seriesIndexNum,
      seriesTotal: seriesTotalNum,
      tradingMethod,
      imageUrls,
      sellerId: req.userId!,
      characterId,
    },
    include: { seller: true, character: true, _count: { select: { likes: true } } },
  });

  res.status(201).json(serializeListing(listing, false));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const listingId = String(req.params.id);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (listing.sellerId !== req.userId) {
    res.status(403).json({ error: "You can only delete your own listings" });
    return;
  }

  await prisma.listing.delete({ where: { id: listingId } });
  res.status(204).end();
});

router.post("/:id/like", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const listingId = String(req.params.id);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const existing = await prisma.like.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, listingId } });
  }

  const likesCount = await prisma.like.count({ where: { listingId } });
  res.json({ liked: !existing, likesCount });
});

export default router;
