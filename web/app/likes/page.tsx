"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/components/AuthProvider";
import { fetchMyLikes } from "@/lib/authApi";
import { fetchCharacters } from "@/lib/api";
import type { Character, Listing } from "@/lib/types";

export default function LikesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [likes, setLikes] = useState<Listing[]>([]);
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
    fetchMyLikes()
      .then(setLikes)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load likes"))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <h1 className="mb-6 text-sm font-medium text-neutral-900">likes</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!error && loading && <p className="text-sm text-neutral-400">Loading…</p>}
        {!error && !loading && likes.length === 0 && (
          <p className="text-sm text-neutral-400">
            You haven&apos;t liked anything yet — browse listings and tap the heart.
          </p>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10">
          {likes.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
