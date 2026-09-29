import type { Character, Listing, PublicProfile, SortOption } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function resolveUploadUrl(path: string): string {
  return `${API_URL}${path}`;
}

// Listings may reference either a server-uploaded file (/uploads/...) or a
// static asset already bundled with the web app (/images/...). Resolve
// whichever is present to a src usable directly in an <Image>.
export function resolveListingPhotoUrl(imageUrls: string[]): string | null {
  const url = imageUrls.find((u) => u.length > 0);
  if (!url) return null;
  return url.startsWith("/uploads/") ? resolveUploadUrl(url) : url;
}

export function resolveListingPhotoUrls(imageUrls: string[]): string[] {
  return imageUrls
    .filter((u) => u.length > 0)
    .map((u) => (u.startsWith("/uploads/") ? resolveUploadUrl(u) : u));
}

export type ListingFilters = {
  sort?: SortOption;
  characters?: string[];
  priceMin?: number;
  priceMax?: number;
};

export async function fetchListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const params = new URLSearchParams();
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.characters?.length) params.set("characters", filters.characters.join(","));
  if (filters.priceMin !== undefined) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set("priceMax", String(filters.priceMax));

  const res = await fetch(`${API_URL}/api/listings?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function fetchListing(id: string): Promise<Listing> {
  const res = await fetch(`${API_URL}/api/listings/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}

export async function fetchUserProfile(
  username: string
): Promise<{ profile: PublicProfile; listings: Listing[] }> {
  const res = await fetch(`${API_URL}/api/users/${username}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch(`${API_URL}/api/characters`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}
