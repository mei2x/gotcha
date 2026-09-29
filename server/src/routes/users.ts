import { Router } from "express";
import { prisma } from "../prisma";
import { getUserIdFromRequest } from "../auth";
import { serializeListing } from "./listings";

const router = Router();

router.get("/:username", async (req, res) => {
  const username = String(req.params.username);
  const viewerId = getUserIdFromRequest(req);

  const user = await prisma.user.findUnique({
    where: { username },
    include: { favoriteCharacters: { include: { character: true } } },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [ratingAgg, reviewCount, listings] = await Promise.all([
    prisma.review.aggregate({
      where: { revieweeId: user.id },
      _avg: { rating: true },
    }),
    prisma.review.count({ where: { revieweeId: user.id } }),
    prisma.listing.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { seller: true, character: true, _count: { select: { likes: true } } },
    }),
  ]);

  const likedListingIds = viewerId
    ? new Set(
        (
          await prisma.like.findMany({
            where: { userId: viewerId, listingId: { in: listings.map((l) => l.id) } },
            select: { listingId: true },
          })
        ).map((like) => like.listingId)
      )
    : new Set<string>();

  res.json({
    profile: {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      preferredTradingMethod: user.preferredTradingMethod,
      city: user.city,
      state: user.state,
      tradingSinceYear: user.createdAt.getFullYear(),
      favoriteCharacters: user.favoriteCharacters.map((f) => ({
        id: f.character.id,
        name: f.character.name,
        slug: f.character.slug,
        iconUrl: f.character.iconUrl,
        color: f.color,
        textColor: f.textColor,
      })),
      rating: { average: ratingAgg._avg.rating, count: reviewCount },
    },
    listings: listings.map((listing) => serializeListing(listing, likedListingIds.has(listing.id))),
  });
});

export default router;
