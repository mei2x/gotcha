"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrowseSidebar } from "@/components/BrowseSidebar";
import { ListingCard } from "@/components/ListingCard";
import { fetchCharacters, fetchListings } from "@/lib/api";
import type { Character, Listing, SortOption } from "@/lib/types";

export default function BrowsePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => setError("Couldn't load characters"));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchListings({
      sort,
      characters: selectedCharacters,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    })
      .then(setListings)
      .catch(() => setError("Couldn't load listings — is the API server running?"))
      .finally(() => setLoading(false));
  }, [sort, selectedCharacters, priceMin, priceMax]);

  function toggleCharacter(slug: string) {
    setSelectedCharacters((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />
      <div className="flex flex-1 gap-8 px-8 py-8">
        <BrowseSidebar
          characters={characters}
          sort={sort}
          onSortChange={setSort}
          selectedCharacters={selectedCharacters}
          onToggleCharacter={toggleCharacter}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMinChange={setPriceMin}
          onPriceMaxChange={setPriceMax}
        />
        <main className="flex-1">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!error && loading && <p className="text-sm text-neutral-400">Loading…</p>}
          {!error && !loading && listings.length === 0 && (
            <p className="text-sm text-neutral-400">No listings match your filters.</p>
          )}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
