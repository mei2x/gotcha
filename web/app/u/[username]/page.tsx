"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/components/AuthProvider";
import { fetchCharacters, fetchUserProfile } from "@/lib/api";
import { resolveAvatarUrl } from "@/lib/authApi";
import type { Character, Listing, PublicProfile } from "@/lib/types";

const TRADING_METHOD_LABEL: Record<string, string> = {
  shipping: "shipping",
  in_person: "in-person trade",
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && user.username === params.username) {
      router.push("/account");
      return;
    }
    fetchUserProfile(params.username)
      .then(({ profile, listings }) => {
        setProfile(profile);
        setListings(listings);
      })
      .catch(() => setNotFound(true));
  }, [params.username, user, router]);

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col">
        <Header characters={characters} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <p className="text-sm text-red-500">This user doesn&apos;t exist.</p>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col">
        <Header characters={characters} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <p className="text-sm text-neutral-400">Loading…</p>
        </main>
      </div>
    );
  }

  const avatarUrl = resolveAvatarUrl(profile.avatarUrl);

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />

      <div className="grid flex-1 grid-cols-1 gap-6 px-4 pb-6 pt-4 sm:px-8 sm:pb-8 lg:grid-cols-[1fr_1.6fr] lg:gap-8 lg:px-10 lg:pb-10 lg:pt-6">
        <section className="order-2 self-start rounded-3xl border border-neutral-200 p-4 sm:p-6 lg:order-none">
          <h2 className="mb-4 text-sm font-medium text-neutral-900">posts</h2>
          {listings.length === 0 ? (
            <p className="text-sm text-neutral-400">{profile.username} hasn&apos;t posted anything yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {listings.slice(0, 2).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          {listings.length > 2 && (
            <div className="mt-4 flex justify-end">
              <Link
                href={`/u/${profile.username}/posts`}
                className="text-xs text-neutral-400 hover:text-neutral-900"
              >
                more
              </Link>
            </div>
          )}
        </section>

        <section className="order-1 rounded-3xl border border-neutral-200 p-4 sm:p-6 lg:order-none lg:p-8">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-medium text-neutral-900">profile</h2>
            <div className="flex flex-col items-end gap-2">
              <StarRating average={profile.rating.average} count={profile.rating.count} label="rating" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 pb-5 lg:grid-cols-[auto_1fr] lg:gap-10 lg:pl-6">
            <div className="flex flex-col items-center gap-8">
              <div>
                <p className="text-xl font-medium text-neutral-900">{profile.username}</p>
                <p className="text-xs text-neutral-400">username</p>
              </div>
              <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-neutral-200 text-xs text-neutral-300 sm:h-52 sm:w-52 lg:h-60 lg:w-60">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={profile.username} fill unoptimized className="object-cover" />
                ) : (
                  <span>avatar</span>
                )}
              </div>
              {profile.bio && (
                <div className="w-48 rounded-xl border border-neutral-200 p-4 text-sm text-neutral-700">
                  {profile.bio}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-8 p-4 sm:p-6 lg:gap-10 lg:p-6">
              <div>
                <p className="text-xs text-neutral-400">Trading since</p>
                <p className="text-3xl font-medium text-neutral-900 sm:text-4xl lg:text-5xl">
                  {profile.tradingSinceYear}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-neutral-400">preferred trading method</p>
                <p className="text-sm text-neutral-700">
                  {profile.preferredTradingMethod
                    ? TRADING_METHOD_LABEL[profile.preferredTradingMethod]
                    : "not set"}
                </p>
                <p className="mb-1 mt-3 text-xs text-neutral-400">location</p>
                <p className="text-sm text-neutral-700">
                  {profile.city && profile.state ? `${profile.city}, ${profile.state}` : "not set"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-neutral-400">favorite characters</p>
                <div className="grid grid-cols-4 gap-2">
                  {profile.favoriteCharacters.length === 0 ? (
                    <p className="col-span-4 text-sm text-neutral-400">none yet</p>
                  ) : (
                    profile.favoriteCharacters.map((character) => (
                      <div
                        key={character.id}
                        className="flex aspect-square w-full items-center justify-center rounded-2xl px-2 text-center text-xs font-medium"
                        style={{ backgroundColor: character.color, color: character.textColor }}
                      >
                        {character.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
