"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CharacterPlaceholder } from "@/components/CharacterPlaceholder";
import { HeartButton } from "@/components/HeartButton";
import { TradeFlowModal } from "@/components/TradeFlowModal";
import { useAuth } from "@/components/AuthProvider";
import { fetchCharacters, fetchListing, resolveListingPhotoUrls } from "@/lib/api";
import { toggleLike } from "@/lib/authApi";
import type { Character, Listing } from "@/lib/types";

const RARITY_LABEL: Record<Listing["rarity"], string> = {
  common: "common",
  semi_rare: "semi-rare",
  rare: "rare",
  ultra_rare: "ultra-rare",
};

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => {});
  }, []);

  useEffect(() => {
    fetchListing(params.id)
      .then((data) => {
        setListing(data);
        setLiked(data.likedByMe);
      })
      .catch(() => setError("Couldn't load this post"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleLikeToggle() {
    if (!listing) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikePending(true);
    try {
      const result = await toggleLike(listing.id);
      setLiked(result.liked);
    } catch {
      setLiked(!next);
    } finally {
      setLikePending(false);
    }
  }

  function handleTradeClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    setTradeModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <Header characters={characters} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← back
          </button>
          <p className="text-sm text-neutral-400">Loading…</p>
        </main>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-1 flex-col">
        <Header characters={characters} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← back
          </button>
          <p className="text-sm text-red-500">{error ?? "This post doesn't exist."}</p>
        </main>
      </div>
    );
  }

  const photos = resolveListingPhotoUrls(listing.imageUrls);

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />

      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-8 sm:py-10">
        <div className="w-full max-w-3xl">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← back
          </button>
        </div>
        <div className="flex w-full max-w-3xl flex-col gap-6 sm:flex-row sm:gap-10">
          <div className="flex w-full flex-col gap-3 sm:max-w-sm">
            {photos.length > 0 ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <Image
                  src={photos[activePhoto]}
                  alt={listing.character.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <CharacterPlaceholder name={listing.character.name} className="aspect-square w-full" />
            )}
            {photos.length > 1 && (
              <div className="flex gap-2">
                {photos.map((photo, i) => (
                  <button
                    key={photo}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={`relative h-16 w-16 overflow-hidden rounded-lg border ${
                      i === activePhoto ? "border-neutral-900" : "border-neutral-200"
                    }`}
                  >
                    <Image src={photo} alt="" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="lowercase font-medium text-neutral-900">{listing.character.name}</p>
                <p className="lowercase text-lg font-medium text-neutral-900">{listing.title}</p>
                <p className="lowercase text-sm text-neutral-500">{listing.series}</p>
              </div>
              <HeartButton liked={liked} disabled={likePending} onToggle={handleLikeToggle} />
            </div>

            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>{RARITY_LABEL[listing.rarity]}</span>
              <span>
                {listing.seriesIndex}/{listing.seriesTotal}
              </span>
            </div>

            {listing.description && (
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{listing.description}</p>
            )}

            <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-sm">
              <div>
                <p className="text-xs text-neutral-400">Trade</p>
                <p>{listing.tradingMethod}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">with</p>
                <Link href={`/u/${listing.seller.username}`} className="font-medium hover:underline">
                  {listing.seller.username}
                </Link>
              </div>
            </div>

            {user?.username !== listing.seller.username && (
              <button
                onClick={handleTradeClick}
                className="rounded-full border border-neutral-900 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Trade
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {tradeModalOpen && (
        <TradeFlowModal toListing={listing} onClose={() => setTradeModalOpen(false)} />
      )}
    </div>
  );
}
