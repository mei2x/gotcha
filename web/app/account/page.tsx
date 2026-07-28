"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { TradeHistoryRow } from "@/components/TradeHistoryRow";
import { ListingCard } from "@/components/ListingCard";
import { AvatarUpload } from "@/components/AvatarUpload";
import { BioEditor } from "@/components/BioEditor";
import { TradingMethodPicker } from "@/components/TradingMethodPicker";
import { ZipCodeEditor } from "@/components/ZipCodeEditor";
import { useAuth } from "@/components/AuthProvider";
import { fetchProfile, fetchMyTrades, fetchMyListings, updateProfile } from "@/lib/authApi";
import { fetchCharacters } from "@/lib/api";
import type { Character, Listing, Profile, Trade } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateUser } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
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

      <div className="grid flex-1 grid-cols-1 gap-8 px-10 pb-10 pt-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-8">
          <section className="rounded-3xl border border-neutral-200 p-6">
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
            <div className="grid grid-cols-2 gap-4">
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

        <section className="rounded-3xl border border-neutral-200 p-8">
          {!profile ? (
            <p className="text-sm text-neutral-400">Loading…</p>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <h2 className="text-sm font-medium text-neutral-900">my account</h2>
                <div className="flex items-start gap-4">
                  <StarRating average={profile.rating.average} count={profile.rating.count} />
                  <button
                    onClick={() => logout().then(() => router.push("/"))}
                    className="text-xs text-neutral-400 hover:text-neutral-900"
                  >
                    log out
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-35 sm:grid-cols-[auto_1fr] pl-15 pb-5">
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

                <div className="flex flex-col gap-15 p-10">
                  <div>
                    <p className="text-xs text-neutral-400">Trading since</p>
                    <p className="text-5xl font-medium text-neutral-900">
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
                    <p className="mb-1 mt-3 text-xs text-neutral-400">zip code</p>
                    <ZipCodeEditor
                      initialZip={profile.zipCode}
                      onSave={async (zip) => {
                        const updated = await updateProfile({ zipCode: zip });
                        setProfile(updated);
                      }}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-neutral-400">favorite characters</p>
                    <div className="flex gap-2">
                      {profile.favoriteCharacters.map((character) =>
                        character.iconUrl ? (
                          <Image
                            key={character.id}
                            src={character.iconUrl}
                            alt={character.name}
                            title={character.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 shrink-0 object-contain"
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
