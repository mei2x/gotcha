"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CharacterPlaceholder } from "./CharacterPlaceholder";
import { CutMark } from "./CutMark";
import { HeartButton } from "./HeartButton";
import { TradeFlowModal } from "./TradeFlowModal";
import Image from "next/image";
import { useAuth } from "./AuthProvider";
import { toggleLike, deleteListing } from "@/lib/authApi";
import { resolveListingPhotoUrl } from "@/lib/api";
import type { Listing } from "@/lib/types";

const RARITY_LABEL: Record<Listing["rarity"], string> = {
  common: "common",
  semi_rare: "semi-rare",
  rare: "rare",
  ultra_rare: "ultra-rare",
};

export function ListingCard({
  listing,
  variant = "full",
  onDeleted,
}: {
  listing: Listing;
  variant?: "full" | "compact";
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [liked, setLiked] = useState(listing.likedByMe);
  const [pending, setPending] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteListing(listing.id);
      onDeleted?.(listing.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn't delete listing");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  function handleTradeClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    setTradeModalOpen(true);
  }

  async function handleToggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    const next = !liked;
    setLiked(next);
    setPending(true);
    try {
      const result = await toggleLike(listing.id);
      setLiked(result.liked);
    } catch {
      setLiked(!next);
    } finally {
      setPending(false);
    }
  }

  const photoUrl = resolveListingPhotoUrl(listing.imageUrls);

  return (
    <div className="flex flex-col">
      <Link href={`/listing/${listing.id}`}>
        {photoUrl ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
            <Image
              src={photoUrl}
              alt={listing.character.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <CharacterPlaceholder
            name={listing.character.name}
            className="aspect-square w-full"
          />
        )}
      </Link>
      <div className="flex items-start justify-between pt-5">
        <Link href={`/listing/${listing.id}`}>
          <p className="lowercase font-medium text-neutral-900">{listing.character.name}</p>
          <p className="lowercase text-xs text-neutral-500">{listing.title}</p>
          <p className="lowercase text-xs text-neutral-500">{listing.series}</p>
        </Link>
        <div className="flex flex-col items-end gap-3 text-right">
          {variant === "full" && (
            <HeartButton liked={liked} disabled={pending} onToggle={handleToggle} />
          )}
          <div>
            <p className="text-xs text-neutral-500">{RARITY_LABEL[listing.rarity]}</p>
            <p>
              {listing.seriesIndex}/{listing.seriesTotal}
            </p>
          </div>
        </div>
      </div>
      {variant === "full" && (
        <>
          <div className="flex w-full items-center justify-between pb-3">
            <div className="">
              <p className="text-xs text-neutral-400">Trade</p>
              <p className="text-xs">{listing.tradingMethod}</p>
            </div>
            <Image
              src={"/images/claw_2.png"}
              alt="Claws"
              unoptimized
              width={4}
              height={4}
              className="h-15 w-15"
            />
            <div className="text-end">
              <p className="text-xs text-neutral-400">with</p>
              <Link href={`/u/${listing.seller.username}`} className="text-m font-medium hover:underline">
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
        </>
      )}
      {variant === "compact" && (
        <div className="pt-2">
          {confirmingDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">delete this post?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                {deleting ? "deleting…" : "yes"}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="text-neutral-400 hover:text-neutral-700"
              >
                no
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Link
                href={`/listing/${listing.id}/edit`}
                className="text-xs text-neutral-400 hover:text-neutral-900"
              >
                edit
              </Link>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="text-xs text-neutral-400 hover:text-red-500"
              >
                delete
              </button>
            </div>
          )}
          {deleteError && <p className="mt-1 text-xs text-red-500">{deleteError}</p>}
        </div>
      )}
      {tradeModalOpen && (
        <TradeFlowModal toListing={listing} onClose={() => setTradeModalOpen(false)} />
      )}
    </div>
  );
}
