import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
const JWT_SECRET: string = process.env.JWT_SECRET;

const SESSION_COOKIE = "gotcha_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSession(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });
}

const isProduction = process.env.NODE_ENV === "production";

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    // In production the web app and API live on different domains
    // (e.g. Vercel + Render), so the cookie must be sameSite:none to be
    // sent on cross-site fetch requests. That requires secure:true, which
    // only works over HTTPS — fine in production, not on local http dev.
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE);
}

export function getUserIdFromRequest(req: Request): string | null {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return payload.sub;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.userId = userId;
  next();
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
