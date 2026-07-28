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

const router = Router();

const TRADING_METHODS = new Set(["shipping", "in_person"]);

function publicUser(user: { id: string; username: string; email: string; avatarUrl: string | null }) {
  return { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl };
}

async function buildProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { favoriteCharacters: true },
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
    zipCode: user.zipCode,
    tradingSinceYear: user.createdAt.getFullYear(),
    favoriteCharacters: user.favoriteCharacters.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      iconUrl: c.iconUrl,
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
  const { bio, preferredTradingMethod, zipCode } = req.body ?? {};

  const data: {
    bio?: string;
    preferredTradingMethod?: string;
    zipCode?: string;
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

  if (zipCode !== undefined) {
    if (typeof zipCode !== "string" || !/^\d{5}$/.test(zipCode)) {
      res.status(400).json({ error: "Zip code must be exactly 5 digits" });
      return;
    }
    data.zipCode = zipCode;
  }

  await prisma.user.update({ where: { id: req.userId }, data });

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
