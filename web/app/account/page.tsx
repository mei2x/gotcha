"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { TradeHistoryRow } from "@/components/TradeHistoryRow";
import { ListingCard } from "@/components/ListingCard";
import { AvatarUpload } from "@/components/AvatarUpload";
import { BioEditor } from "@/components/BioEditor";
import { TradingMethodPicker } from "@/components/TradingMethodPicker";
import { LocationEditor } from "@/components/LocationEditor";
import { AddFavoriteCharacterModal } from "@/components/AddFavoriteCharacterModal";
import { FavoriteCharacterBox } from "@/components/FavoriteCharacterBox";
import { useAuth } from "@/components/AuthProvider";
import {
  fetchProfile,
  fetchMyTrades,
  fetchMyListings,
  updateProfile,
  addFavoriteCharacter,
  removeFavoriteCharacter,
} from "@/lib/authApi";
import { fetchCharacters } from "@/lib/api";
import type { Character, Listing, Profile, Trade } from "@/lib/types";

const MAX_FAVORITE_CHARACTERS = 8;

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateUser } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addFavoriteOpen, setAddFavoriteOpen] = useState(false);

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
    Promise.all([fetchProfile(), fetchMyTrades(), fetchMyListings()])
      .then(([p, t, l]) => {
        setProfile(p);
        setTrades(t);
        setMyListings(l);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load profile"));
  }, [user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />

      <div className="grid flex-1 grid-cols-1 gap-6 px-4 pb-6 pt-4 sm:px-8 sm:pb-8 lg:grid-cols-[1fr_1.6fr] lg:gap-8 lg:px-10 lg:pb-10 lg:pt-6">
        <div className="order-2 flex flex-col gap-6 sm:gap-8 lg:order-none">
          <section className="rounded-3xl border border-neutral-200 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-900">my posts</h2>
              <Link href="/account/posts" className="text-xs text-neutral-400 hover:text-neutral-900">
                more
              </Link>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!error && myListings.length === 0 && (
              <p className="text-sm text-neutral-400">You haven&apos;t posted anything yet.</p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {myListings.slice(0, 2).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  variant="compact"
                  onDeleted={(id) =>
                    setMyListings((prev) => prev.filter((l) => l.id !== id))
                  }
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-900">previous trades</h2>
              <Link href="/account/trades" className="text-xs text-neutral-400 hover:text-neutral-900">
                more
              </Link>
            </div>
            {!error && trades.length === 0 && (
              <p className="text-sm text-neutral-400">No trades yet.</p>
            )}
            <div>
              {trades.slice(0, 2).map((trade) => (
                <TradeHistoryRow key={trade.id} trade={trade} />
              ))}
            </div>
          </section>
        </div>

        <section className="order-1 rounded-3xl border border-neutral-200 p-4 sm:p-6 lg:order-none lg:p-8">
          {!profile ? (
            <p className="text-sm text-neutral-400">Loading…</p>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <h2 className="text-sm font-medium text-neutral-900">my account</h2>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => logout().then(() => router.push("/"))}
                    className="text-xs text-neutral-400 hover:text-neutral-900"
                  >
                    log out
                  </button>
                  <StarRating average={profile.rating.average} count={profile.rating.count} />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-8 pb-5 lg:grid-cols-[auto_1fr] lg:gap-16 lg:pl-10">
                <div className="flex flex-col items-center gap-8">
                  <div>
                    <p className="text-xl font-medium text-neutral-900 ">{profile.username}</p>
                    <p className="text-xs text-neutral-400">username</p>
                  </div>
                  <AvatarUpload
                    avatarUrl={profile.avatarUrl}
                    onUploaded={(updated) => {
                      setProfile((prev) => (prev ? { ...prev, avatarUrl: updated.avatarUrl } : prev));
                      updateUser(updated);
                    }}
                  />
                  <div className="w-60">
                    <BioEditor
                      initialBio={profile.bio}
                      onSave={async (bio) => {
                        const updated = await updateProfile({ bio });
                        setProfile(updated);
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-8 p-4 sm:p-6 lg:gap-10 lg:p-10">
                  <div>
                    <p className="text-xs text-neutral-400">Trading since</p>
                    <p className="text-3xl font-medium text-neutral-900 sm:text-4xl lg:text-5xl">
                      {profile.tradingSinceYear}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-neutral-400">preferred trading method</p>
                    <TradingMethodPicker
                      value={profile.preferredTradingMethod}
                      onChange={async (method) => {
                        const updated = await updateProfile({ preferredTradingMethod: method });
                        setProfile(updated);
                      }}
                    />
                    <p className="mb-1 mt-3 text-xs text-neutral-400">location</p>
                    <LocationEditor
                      initialCity={profile.city}
                      initialState={profile.state}
                      onSave={async (city, state) => {
                        const updated = await updateProfile({ city, state });
                        setProfile(updated);
                      }}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-neutral-400">
                      favorite characters ({profile.favoriteCharacters.length}/{MAX_FAVORITE_CHARACTERS})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteCharacters.map((character) => (
                        <FavoriteCharacterBox
                          key={character.id}
                          character={character}
                          onRemove={async () => {
                            const updated = await removeFavoriteCharacter(character.id);
                            setProfile(updated);
                          }}
                        />
                      ))}
                      {profile.favoriteCharacters.length < MAX_FAVORITE_CHARACTERS && (
                        <button
                          type="button"
                          onClick={() => setAddFavoriteOpen(true)}
                          aria-label="Add a favorite character"
                          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-neutral-300 text-2xl text-neutral-400 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {addFavoriteOpen && profile && (
        <AddFavoriteCharacterModal
          characters={characters}
          excludeIds={new Set(profile.favoriteCharacters.map((c) => c.id))}
          onAdd={async (characterId, color, textColor) => {
            const updated = await addFavoriteCharacter(characterId, color, textColor);
            setProfile(updated);
          }}
          onClose={() => setAddFavoriteOpen(false)}
        />
      )}
    </div>
  );
}
