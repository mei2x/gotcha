import Image from "next/image";
import { CharacterPlaceholder } from "./CharacterPlaceholder";
import { CutMark } from "./CutMark";
import { resolveListingPhotoUrl } from "@/lib/api";
import type { Trade, TradeListingSummary } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
}

function TradeThumbnail({ item }: { item: TradeListingSummary }) {
  const photoUrl = resolveListingPhotoUrl(item.imageUrls);
  if (photoUrl) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
        <Image src={photoUrl} alt={item.character.name} fill unoptimized className="object-cover" />
      </div>
    );
  }
  return (
    <CharacterPlaceholder
      name={item.character.name}
      className="h-14 w-14 shrink-0 text-[9px]"
    />
  );
}

export function TradeHistoryRow({ trade }: { trade: Trade }) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-200 py-4 last:border-none">
      <p className="text-xs text-neutral-400">{formatDate(trade.completedAt)}</p>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <TradeThumbnail item={trade.mine} />
          <div className="min-w-0">
            <p className="truncate text-sm text-neutral-900">{trade.mine.character.name.toLowerCase()}</p>
            <p className="truncate text-xs text-neutral-400">{trade.mine.series}</p>
          </div>
        </div>
        <CutMark className="h-5 w-5 shrink-0 text-neutral-300" />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <TradeThumbnail item={trade.theirs} />
          <div className="min-w-0">
            <p className="truncate text-sm text-neutral-900">{trade.theirs.character.name.toLowerCase()}</p>
            <p className="truncate text-xs text-neutral-400">{trade.theirs.series}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
