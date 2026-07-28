"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ImagePicker } from "@/components/ImagePicker";
import { TradingMethodPicker } from "@/components/TradingMethodPicker";
import { useAuth } from "@/components/AuthProvider";
import { createListing } from "@/lib/authApi";
import { fetchCharacters } from "@/lib/api";
import type { Character, Rarity } from "@/lib/types";

const RARITY_OPTIONS: { value: Rarity; label: string }[] = [
  { value: "common", label: "common" },
  { value: "semi_rare", label: "semi-rare" },
  { value: "rare", label: "rare" },
  { value: "ultra_rare", label: "ultra-rare" },
];

export default function PostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [series, setSeries] = useState("");
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
    fetchCharacters().then((list) => {
      setCharacters(list);
      if (list.length > 0) setCharacterId(list[0].id);
    });
  }, []);

  if (authLoading || !user) {
    return null;
  }

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
      await createListing({
        title,
        series,
        characterId,
        rarity,
        seriesIndex,
        seriesTotal,
        tradingMethod,
        images,
      });
      router.push("/browse");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />

      <main className="flex flex-1 justify-center px-8 py-10">
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
          <h1 className="mb-2 text-lg font-medium text-neutral-900">Make a Post</h1>

          <ImagePicker images={images} onChange={setImages} />

          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <input
                type="text"
                required
                placeholder="character"
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
            <p className="mb-1 text-xs text-neutral-400">character</p>
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="w-full rounded border border-neutral-300 px-2 py-1 text-sm text-neutral-900"
            >
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
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
            {submitting ? "posting…" : "post"}
          </button>
        </form>
      </main>
    </div>
  );
}
