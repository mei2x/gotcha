"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/components/AuthProvider";
import { fetchMyListings } from "@/lib/authApi";
import { fetchCharacters } from "@/lib/api";
import type { Character, Listing } from "@/lib/types";

export default function MyPostsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchMyListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load posts"))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />
      <main className="flex-1 px-4 py-6 sm:px-10 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-sm font-medium text-neutral-900">my posts</h1>
          <Link href="/account" className="text-xs text-neutral-400 hover:text-neutral-900">
            back to account
          </Link>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {!error && loading && <p className="text-sm text-neutral-400">Loading…</p>}
        {!error && !loading && listings.length === 0 && (
          <p className="text-sm text-neutral-400">You haven&apos;t posted anything yet.</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant="compact"
              onDeleted={(id) => setListings((prev) => prev.filter((l) => l.id !== id))}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
