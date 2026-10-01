import { Router } from "express";
import { prisma } from "../prisma";
import {
  hashPassword,
  verifyPassword,
  signSession,
  setSessionCookie,
  clearSessionCookie,
  getUserIdFromRequest,
  requireAuth,
} from "../auth";
import { uploadAvatar } from "../upload";
import type { Rarity } from "../generated/prisma/client";

const router = Router();

const TRADING_METHODS = new Set(["shipping", "in_person"]);

function publicUser(user: { id: string; username: string; email: string; avatarUrl: string | null }) {
  return { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl };
}

async function buildProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { favoriteCharacters: { include: { character: true } } },
  });
  if (!user) return null;

  const [ratingAgg, reviewCount] = await Promise.all([
    prisma.review.aggregate({
      where: { revieweeId: user.id },
      _avg: { rating: true },
    }),
    prisma.review.count({ where: { revieweeId: user.id } }),
  ]);

  return {
    ...publicUser(user),
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
    rating: {
      average: ratingAgg._avg.rating,
      count: reviewCount,
    },
  };
}

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body ?? {};

  if (typeof username !== "string" || username.trim().length < 2) {
    res.status(400).json({ error: "Username must be at least 2 characters" });
    return;
  }
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ error: "Enter a valid email address" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    res.status(409).json({ error: "An account with that email or username already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username: username.trim(), email: email.trim().toLowerCase(), passwordHash },
  });

  const token = signSession(user.id);
  setSessionCookie(res, token);
  res.status(201).json({ user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Incorrect email or password" });
    return;
  }

  const token = signSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: publicUser(user) });
});

const DEMO_USERNAME = process.env.DEMO_USERNAME ?? "demo";

type DemoSnapshotData = {
  bio: string | null;
  preferredTradingMethod: string | null;
  city: string | null;
  state: string | null;
  avatarUrl: string | null;
  favoriteCharacters: { characterId: string; color: string; textColor: string }[];
  listings: {
    title: string;
    series: string;
    description: string | null;
    rarity: string;
    seriesIndex: number;
    seriesTotal: number;
    tradingMethod: string;
    imageUrls: string[];
    characterId: string;
  }[];
};

// Wipes whatever the demo account currently looks like (posts, favorites,
// likes it gave out, trade requests/trades it's part of) and replays the
// last captured snapshot, so every /demo visitor starts from the same
// curated state regardless of what previous visitors did.
async function resetDemoAccount(userId: string) {
  const snapshot = await prisma.demoSnapshot.findUnique({ where: { userId } });
  if (!snapshot) return;
  const data = snapshot.data as unknown as DemoSnapshotData;

  await prisma.$transaction([
    prisma.like.deleteMany({ where: { userId } }),
    prisma.tradeRequest.deleteMany({ where: { OR: [{ fromUserId: userId }, { toUserId: userId }] } }),
    prisma.trade.deleteMany({ where: { OR: [{ fromUserId: userId }, { toUserId: userId }] } }),
    prisma.listing.deleteMany({ where: { sellerId: userId } }),
    prisma.favoriteCharacter.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        bio: data.bio,
        preferredTradingMethod: data.preferredTradingMethod,
        city: data.city,
        state: data.state,
        avatarUrl: data.avatarUrl,
      },
    }),
    prisma.favoriteCharacter.createMany({
      data: data.favoriteCharacters.map((f) => ({ ...f, userId })),
    }),
    prisma.listing.createMany({
      data: data.listings.map((l) => ({ ...l, sellerId: userId, rarity: l.rarity as Rarity })),
    }),
  ]);
}

// Lets a portfolio iframe auto-login a single, dedicated public demo
// account — no credentials involved, and it can never log in as anyone
// else. Treat the demo account as public: never put real data in it.
router.post("/demo-login", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { username: DEMO_USERNAME } });
  if (!user) {
    res.status(404).json({ error: "Demo account isn't set up yet" });
    return;
  }

  await resetDemoAccount(user.id);

  const token = signSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: publicUser(user) });
});

// Captures the demo account's current state (profile, favorites, listings)
// as the baseline that /demo-login resets back to. Deliberately NOT gated
// by a login session — anyone visiting /demo is logged in as the demo
// account, so a session check can't tell the owner apart from a random
// visitor. Only someone who knows DEMO_SNAPSHOT_SECRET (set as an env var,
// never in the browser) can call this — call it with:
//   curl -X POST <api>/api/auth/demo-snapshot -H "x-demo-secret: <secret>"
router.post("/demo-snapshot", async (req, res) => {
  const secret = process.env.DEMO_SNAPSHOT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "DEMO_SNAPSHOT_SECRET isn't configured on the server" });
    return;
  }
  if (req.header("x-demo-secret") !== secret) {
    res.status(403).json({ error: "Invalid or missing x-demo-secret header" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username: DEMO_USERNAME },
    include: {
      favoriteCharacters: true,
      listings: true,
    },
  });
  if (!user) {
    res.status(404).json({ error: "Demo account isn't set up yet" });
    return;
  }

  const data: DemoSnapshotData = {
    bio: user.bio,
    preferredTradingMethod: user.preferredTradingMethod,
    city: user.city,
    state: user.state,
    avatarUrl: user.avatarUrl,
    favoriteCharacters: user.favoriteCharacters.map((f) => ({
      characterId: f.characterId,
      color: f.color,
      textColor: f.textColor,
    })),
    listings: user.listings.map((l) => ({
      title: l.title,
      series: l.series,
      description: l.description,
      rarity: l.rarity,
      seriesIndex: l.seriesIndex,
      seriesTotal: l.seriesTotal,
      tradingMethod: l.tradingMethod,
      imageUrls: l.imageUrls,
      characterId: l.characterId,
    })),
  };

  await prisma.demoSnapshot.upsert({
    where: { userId: user.id },
    create: { userId: user.id, data },
    update: { data },
  });

  res.json({ ok: true, listingCount: data.listings.length, favoriteCount: data.favoriteCharacters.length });
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get("/me", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: publicUser(user) });
});

router.get("/profile", requireAuth, async (req, res) => {
  const profile = await buildProfile(req.userId!);
  if (!profile) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ profile });
});

router.patch("/profile", requireAuth, async (req, res) => {
  const { bio, preferredTradingMethod, city, state } = req.body ?? {};

  const data: {
    bio?: string;
    preferredTradingMethod?: string;
    city?: string;
    state?: string;
  } = {};

  if (bio !== undefined) {
    if (typeof bio !== "string" || bio.length > 500) {
      res.status(400).json({ error: "Bio must be 500 characters or fewer" });
      return;
    }
    data.bio = bio.trim();
  }

  if (preferredTradingMethod !== undefined) {
    if (typeof preferredTradingMethod !== "string" || !TRADING_METHODS.has(preferredTradingMethod)) {
      res.status(400).json({ error: "Preferred trading method must be 'shipping' or 'in_person'" });
      return;
    }
    data.preferredTradingMethod = preferredTradingMethod;
  }

  if (city !== undefined) {
    if (typeof city !== "string" || city.trim().length === 0 || city.length > 100) {
      res.status(400).json({ error: "City must be 1-100 characters" });
      return;
    }
    data.city = city.trim();
  }

  if (state !== undefined) {
    if (typeof state !== "string" || !/^[A-Za-z]{2}$/.test(state)) {
      res.status(400).json({ error: "State must be a 2-letter abbreviation" });
      return;
    }
    data.state = state.toUpperCase();
  }

  await prisma.user.update({ where: { id: req.userId }, data });

  const profile = await buildProfile(req.userId!);
  res.json({ profile });
});

const MAX_FAVORITE_CHARACTERS = 8;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

router.post("/favorite-characters", requireAuth, async (req, res) => {
  const { characterId, color, textColor } = req.body ?? {};

  if (typeof characterId !== "string" || characterId.length === 0) {
    res.status(400).json({ error: "Character is required" });
    return;
  }
  if (typeof color !== "string" || !HEX_COLOR.test(color)) {
    res.status(400).json({ error: "Color must be a valid hex color" });
    return;
  }
  if (typeof textColor !== "string" || !HEX_COLOR.test(textColor)) {
    res.status(400).json({ error: "Text color must be a valid hex color" });
    return;
  }

  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) {
    res.status(400).json({ error: "Unknown character" });
    return;
  }

  const existing = await prisma.favoriteCharacter.findUnique({
    where: { userId_characterId: { userId: req.userId!, characterId } },
  });
  if (existing) {
    res.status(409).json({ error: "Already in your favorites" });
    return;
  }

  const count = await prisma.favoriteCharacter.count({ where: { userId: req.userId! } });
  if (count >= MAX_FAVORITE_CHARACTERS) {
    res.status(400).json({ error: `You can only favorite up to ${MAX_FAVORITE_CHARACTERS} characters` });
    return;
  }

  await prisma.favoriteCharacter.create({
    data: { userId: req.userId!, characterId, color, textColor },
  });

  const profile = await buildProfile(req.userId!);
  res.status(201).json({ profile });
});

router.delete("/favorite-characters/:characterId", requireAuth, async (req, res) => {
  const characterId = String(req.params.characterId);

  const existing = await prisma.favoriteCharacter.findUnique({
    where: { userId_characterId: { userId: req.userId!, characterId } },
  });
  if (!existing) {
    res.status(404).json({ error: "Not in your favorites" });
    return;
  }

  await prisma.favoriteCharacter.delete({ where: { id: existing.id } });

  const profile = await buildProfile(req.userId!);
  res.json({ profile });
});

router.post("/avatar", requireAuth, uploadAvatar.single("avatar"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image uploaded" });
    return;
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { avatarUrl },
  });

  res.json({ user: publicUser(user) });
});

export default router;
