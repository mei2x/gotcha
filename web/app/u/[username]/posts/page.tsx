"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { fetchCharacters, fetchUserProfile } from "@/lib/api";
import type { Character, Listing } from "@/lib/types";

export default function UserPostsPage() {
  const params = useParams<{ username: string }>();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => {});
  }, []);

  useEffect(() => {
    fetchUserProfile(params.username)
      .then(({ listings }) => setListings(listings))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.username]);

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />
      <main className="flex-1 px-4 py-6 sm:px-10 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-sm font-medium text-neutral-900">{params.username}&apos;s posts</h1>
          <Link href={`/u/${params.username}`} className="text-xs text-neutral-400 hover:text-neutral-900">
            back to profile
          </Link>
        </div>

        {notFound && <p className="text-sm text-red-500">This user doesn&apos;t exist.</p>}
        {!notFound && loading && <p className="text-sm text-neutral-400">Loading…</p>}
        {!notFound && !loading && listings.length === 0 && (
          <p className="text-sm text-neutral-400">{params.username} hasn&apos;t posted anything yet.</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
    </div>
  );
}
