import type { Listing, Profile, Trade, TradeRequest, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  return `${API_URL}${avatarUrl}`;
}

async function parseJsonOrThrow(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? "Something went wrong");
  }
  return data;
}

export async function signup(input: { username: string; email: string; password: string }): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.user;
}

export async function login(input: { email: string; password: string }): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export async function fetchProfile(): Promise<Profile> {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseJsonOrThrow(res);
  return data.profile;
}

export async function fetchMyTrades(): Promise<Trade[]> {
  const res = await fetch(`${API_URL}/api/trades/mine`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseJsonOrThrow(res);
  return data;
}

export async function updateProfile(input: {
  bio?: string;
  preferredTradingMethod?: string;
  zipCode?: string;
}): Promise<Profile> {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow(res);
  return data.profile;
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetch(`${API_URL}/api/auth/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await parseJsonOrThrow(res);
  return data.user;
}

export async function toggleLike(listingId: string): Promise<{ liked: boolean; likesCount: number }> {
  const res = await fetch(`${API_URL}/api/listings/${listingId}/like`, {
    method: "POST",
    credentials: "include",
  });
  return parseJsonOrThrow(res);
}

export async function fetchMyLikes(): Promise<Listing[]> {
  const res = await fetch(`${API_URL}/api/likes/mine`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseJsonOrThrow(res);
  return data;
}

export async function fetchMyListings(): Promise<Listing[]> {
  const res = await fetch(`${API_URL}/api/listings/mine`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseJsonOrThrow(res);
  return data;
}

export type NewListingInput = {
  title: string;
  series: string;
  characterId: string;
  rarity: string;
  seriesIndex: string;
  seriesTotal: string;
  tradingMethod: string;
  images: File[];
};

export async function createListing(input: NewListingInput): Promise<Listing> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("series", input.series);
  formData.append("characterId", input.characterId);
  formData.append("rarity", input.rarity);
  formData.append("seriesIndex", input.seriesIndex);
  formData.append("seriesTotal", input.seriesTotal);
  formData.append("tradingMethod", input.tradingMethod);
  input.images.forEach((file) => formData.append("images", file));

  const res = await fetch(`${API_URL}/api/listings`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return parseJsonOrThrow(res);
}

export async function deleteListing(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/listings/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Couldn't delete listing");
  }
}

export type NewTradeRequestInput = {
  fromListingId: string;
  toListingId: string;
  pickupLocation: string;
  proposedDate: string;
  proposedTimes: string[];
};

export async function createTradeRequest(input: NewTradeRequestInput): Promise<TradeRequest> {
  const res = await fetch(`${API_URL}/api/trade-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow(res);
}

export async function fetchIncomingTradeRequests(): Promise<TradeRequest[]> {
  const res = await fetch(`${API_URL}/api/trade-requests/incoming`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseJsonOrThrow(res);
  return data;
}

export async function fetchOutgoingTradeRequests(): Promise<TradeRequest[]> {
  const res = await fetch(`${API_URL}/api/trade-requests/outgoing`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await parseJsonOrThrow(res);
  return data;
}

export async function respondToTradeRequest(
  id: string,
  action: "confirm" | "decline"
): Promise<TradeRequest> {
  const res = await fetch(`${API_URL}/api/trade-requests/${id}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action }),
  });
  return parseJsonOrThrow(res);
}
