"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/Header";
import { ImagePicker } from "@/components/ImagePicker";
import { CharacterAutocomplete } from "@/components/CharacterAutocomplete";
import { TradingMethodPicker } from "@/components/TradingMethodPicker";
import { useAuth } from "@/components/AuthProvider";
import { updateListing } from "@/lib/authApi";
import { fetchCharacters, fetchListing, resolveListingPhotoUrls } from "@/lib/api";
import type { Character, Listing, Rarity } from "@/lib/types";

const RARITY_OPTIONS: { value: Rarity; label: string }[] = [
  { value: "common", label: "common" },
  { value: "semi_rare", label: "semi-rare" },
  { value: "rare", label: "rare" },
  { value: "ultra_rare", label: "ultra-rare" },
];

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [series, setSeries] = useState("");
  const [description, setDescription] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [rarity, setRarity] = useState<Rarity>("common");
  const [seriesIndex, setSeriesIndex] = useState("");
  const [seriesTotal, setSeriesTotal] = useState("");
  const [tradingMethod, setTradingMethod] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => {});
  }, []);

  useEffect(() => {
    fetchListing(params.id)
      .then(setListing)
      .catch(() => setNotFound(true));
  }, [params.id]);

  useEffect(() => {
    if (!listing || characters.length === 0) return;
    setTitle(listing.title);
    setSeries(listing.series);
    setDescription(listing.description ?? "");
    setCharacterId(characters.find((c) => c.slug === listing.character.slug)?.id ?? "");
    setRarity(listing.rarity);
    setSeriesIndex(String(listing.seriesIndex));
    setSeriesTotal(String(listing.seriesTotal));
    setTradingMethod(listing.tradingMethod);
  }, [listing, characters]);

  if (authLoading || !user) {
    return null;
  }

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col">
        <Header characters={characters} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <p className="text-sm text-red-500">This post doesn&apos;t exist.</p>
        </main>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-1 flex-col">
        <Header characters={characters} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <p className="text-sm text-neutral-400">Loading…</p>
        </main>
      </div>
    );
  }

  if (listing.seller.username !== user.username) {
    router.push(`/listing/${listing.id}`);
    return null;
  }

  const existingPhotos = resolveListingPhotoUrls(listing.imageUrls);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!characterId) {
      setError("Choose a character");
      return;
    }
    if (!tradingMethod) {
      setError("Choose shipping or in-person trade");
      return;
    }
    const indexNum = Number(seriesIndex);
    const totalNum = Number(seriesTotal);
    if (!Number.isInteger(indexNum) || !Number.isInteger(totalNum) || indexNum < 1 || totalNum < 1) {
      setError("Enter a valid rarity fraction, e.g. 15 / 23");
      return;
    }

    setSubmitting(true);
    try {
      await updateListing(listing!.id, {
        title,
        series,
        description,
        characterId,
        rarity,
        seriesIndex,
        seriesTotal,
        tradingMethod,
        images,
      });
      router.push(`/listing/${listing!.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-8 sm:py-10">
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
          <h1 className="mb-2 text-lg font-medium text-neutral-900">Edit Post</h1>

          {existingPhotos.length > 0 && images.length === 0 && (
            <div>
              <p className="mb-1 text-xs text-neutral-400">current pictures</p>
              <div className="flex flex-wrap gap-2">
                {existingPhotos.map((src) => (
                  <div
                    key={src}
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200"
                  >
                    <Image src={src} alt="" fill unoptimized className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-neutral-400">add new pictures below to replace these</p>
            </div>
          )}

          <ImagePicker images={images} onChange={setImages} />

          <div>
            <p className="mb-1 text-xs text-neutral-400">character</p>
            <CharacterAutocomplete
              characters={characters}
              value={characterId}
              onChange={setCharacterId}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <input
                type="text"
                required
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-b border-neutral-300 pb-1 font-medium text-neutral-900 outline-none placeholder:text-neutral-300"
              />
              <input
                type="text"
                required
                placeholder="series name"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="border-b border-neutral-300 pb-1 text-xs text-neutral-500 outline-none placeholder:text-neutral-300"
              />
            </div>

            <div className="flex flex-col items-end gap-1 text-right text-xs text-neutral-500">
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value as Rarity)}
                className="rounded border border-neutral-300 px-1 py-0.5 text-xs text-neutral-700"
              >
                {RARITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="15"
                  value={seriesIndex}
                  onChange={(e) => setSeriesIndex(e.target.value)}
                  className="w-12 rounded border border-neutral-300 px-1 py-0.5 text-right"
                />
                <span>/</span>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="23"
                  value={seriesTotal}
                  onChange={(e) => setSeriesTotal(e.target.value)}
                  className="w-12 rounded border border-neutral-300 px-1 py-0.5 text-right"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-neutral-400">description</p>
            <textarea
              required
              rows={4}
              placeholder="condition, details, anything a buyer should know"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded border border-neutral-300 p-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-300"
            />
          </div>

          <div>
            <p className="mb-1 text-xs text-neutral-400">pick-up or shipping</p>
            <TradingMethodPicker
              value={tradingMethod}
              onChange={async (method) => setTradingMethod(method)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full border border-neutral-900 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:opacity-50"
          >
            {submitting ? "saving…" : "save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
