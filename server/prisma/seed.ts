import "dotenv/config";
import { PrismaClient, Rarity } from "../src/generated/prisma/client";
import { hashPassword } from "../src/auth";

const prisma = new PrismaClient();

const CHARACTERS = [
  { name: "Hirono", slug: "hirono", iconUrl: "/images/hirono_color.png" },
  { name: "Labubu", slug: "labubu", iconUrl: "/images/labubu_color.png" },
  { name: "Sonny", slug: "sonny", iconUrl: "/images/sonny_color.png" },
  { name: "Monchichi", slug: "monchichi", iconUrl: "/images/monchichi_color.png" },
  { name: "Skullpanda", slug: "skullpanda", iconUrl: "/images/skullpanda_color.png" },
  { name: "Nyota", slug: "nyota", iconUrl: "/images/nyota_color.png" },
];

async function main() {
  await prisma.like.deleteMany();
  await prisma.review.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.character.deleteMany();
  await prisma.user.deleteMany();

  const seedPasswordHash = await hashPassword("password123");

  const characters = await Promise.all(
    CHARACTERS.map((c) => prisma.character.create({ data: c }))
  );

  const seller = await prisma.user.create({
    data: {
      username: "nyota",
      email: "nyota@example.com",
      passwordHash: seedPasswordHash,
      bio: "collector since middle school. always down to trade!",
      preferredTradingMethod: "in_person",
      zipCode: "90001",
      createdAt: new Date("2021-03-01"),
      favoriteCharacters: {
        connect: characters.slice(0, 3).map((c) => ({ id: c.id })),
      },
    },
  });
  const buyer = await prisma.user.create({
    data: {
      username: "myoka203",
      email: "myoka203@example.com",
      passwordHash: seedPasswordHash,
      bio: "always looking for house series figures",
      preferredTradingMethod: "shipping",
      zipCode: "10012",
      createdAt: new Date("2022-06-15"),
      favoriteCharacters: {
        connect: characters.slice(2, 5).map((c) => ({ id: c.id })),
      },
    },
  });

  const rarities: Rarity[] = ["common", "semi_rare", "rare", "ultra_rare"];

  const listings = characters.flatMap((character, i) =>
    Array.from({ length: 2 }).map((_, j) => ({
      title: seller.username,
      series: "The house series",
      rarity: rarities[(i + j) % rarities.length],
      price: 15 + i * 12 + j * 7,
      seriesIndex: 15,
      seriesTotal: 23,
      tradeWithUsername: "myoka203",
      imageUrls: [`/images/placeholder-${(i % 6) + 1}.png`],
      tradingMethod: seller.preferredTradingMethod ?? "in_person",
      sellerId: seller.id,
      characterId: character.id,
    }))
  );

  await prisma.listing.createMany({ data: listings });

  const allListings = await prisma.listing.findMany({
    orderBy: { createdAt: "asc" },
    include: { character: true },
  });

  await prisma.review.createMany({
    data: [
      {
        reviewerId: buyer.id,
        revieweeId: seller.id,
        rating: 5,
        comment: "Smooth trade, item was exactly as described!",
      },
      {
        reviewerId: buyer.id,
        revieweeId: seller.id,
        rating: 5,
        comment: "Great communication, would trade again.",
      },
    ],
  });

  const TRADE_PAIRS: [number, number, string][] = [
    [0, 1, "2025-02-21"],
    [6, 7, "2025-07-03"],
    [4, 5, "2025-12-16"],
  ];

  function tradeSnapshot(listing: (typeof allListings)[number]) {
    return {
      title: listing.title,
      series: listing.series,
      imageUrls: listing.imageUrls,
      characterName: listing.character.name,
      characterSlug: listing.character.slug,
    };
  }

  for (const [fromIdx, toIdx, completedAt] of TRADE_PAIRS) {
    const fromListing = allListings[fromIdx];
    const toListing = allListings[toIdx];
    const from = tradeSnapshot(fromListing);
    const to = tradeSnapshot(toListing);

    await prisma.trade.create({
      data: {
        fromUserId: seller.id,
        fromListingId: fromListing.id,
        fromTitle: from.title,
        fromSeries: from.series,
        fromImageUrls: from.imageUrls,
        fromCharacterName: from.characterName,
        fromCharacterSlug: from.characterSlug,
        toUserId: buyer.id,
        toListingId: toListing.id,
        toTitle: to.title,
        toSeries: to.series,
        toImageUrls: to.imageUrls,
        toCharacterName: to.characterName,
        toCharacterSlug: to.characterSlug,
        completedAt: new Date(completedAt),
      },
    });
  }

  // Traded items are no longer available as listings.
  const tradedListingIds = TRADE_PAIRS.flatMap(([fromIdx, toIdx]) => [
    allListings[fromIdx].id,
    allListings[toIdx].id,
  ]);
  await prisma.listing.deleteMany({ where: { id: { in: tradedListingIds } } });

  const remainingListings = allListings.filter((l) => !tradedListingIds.includes(l.id));

  await prisma.like.createMany({
    data: [
      { userId: buyer.id, listingId: remainingListings[0].id },
      { userId: buyer.id, listingId: remainingListings[1].id },
    ],
  });

  console.log(`Seeded ${characters.length} characters and ${listings.length} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
