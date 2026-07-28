import { CharacterPlaceholder } from "./CharacterPlaceholder";
import Image from "next/image";
import { resolveListingPhotoUrl } from "@/lib/api";

const RARITY_LABEL: Record<string, string> = {
  common: "common",
  semi_rare: "semi-rare",
  rare: "rare",
  ultra_rare: "ultra-rare",
};

export function TradeItemTile({
  item,
  selected,
  onClick,
  topLabel,
}: {
  item: {
    id: string;
    title: string;
    series: string;
    rarity: string;
    seriesIndex: number;
    seriesTotal: number;
    imageUrls: string[];
    character: { name: string; slug: string };
  };
  selected?: boolean;
  onClick?: () => void;
  topLabel?: React.ReactNode;
}) {
  const photoUrl = resolveListingPhotoUrl(item.imageUrls);

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-xl border p-2 text-left transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${selected ? "border-orange-500 ring-1 ring-orange-500" : "border-neutral-200"}`}
    >
      {topLabel}
      {photoUrl ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          <Image
            src={photoUrl}
            alt={item.character.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <CharacterPlaceholder name={item.character.name} className="aspect-square w-full text-[10px]" />
      )}
      <div className="flex items-start justify-between text-xs">
        <div>
          <p className="font-medium text-neutral-900">{item.title}</p>
          <p className="italic text-neutral-400">{item.series}</p>
        </div>
        <div className="text-right text-neutral-500">
          <p>{RARITY_LABEL[item.rarity]}</p>
          <p>
            {item.seriesIndex}/{item.seriesTotal}
          </p>
        </div>
      </div>
    </div>
  );
}
