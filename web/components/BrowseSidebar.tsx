"use client";

import type { Character } from "@/lib/types";
import type { SortOption } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "newest" },
  { value: "oldest", label: "oldest" },
  { value: "rare_to_common", label: "rare to common" },
  { value: "common_to_rare", label: "common to rare" }
];

export function BrowseSidebar({
  characters,
  sort,
  onSortChange,
  selectedCharacters,
  onToggleCharacter,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
}: {
  characters: Character[];
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedCharacters: string[];
  onToggleCharacter: (slug: string) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
}) {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-8 text-sm">
      <div>
        <h3 className="mb-3 font-medium text-neutral-900">sort</h3>
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-neutral-600">
              <input
                type="radio"
                name="sort"
                checked={sort === option.value}
                onChange={() => onSortChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-medium text-neutral-900">filter</h3>
        <p className="mb-2 text-neutral-500">characters</p>
        <div className="flex flex-col gap-2">
          {characters.map((character) => (
            <label key={character.id} className="flex items-center gap-2 text-neutral-600">
              <input
                type="checkbox"
                checked={selectedCharacters.includes(character.slug)}
                onChange={() => onToggleCharacter(character.slug)}
              />
              <span className="lowercase">{character.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* <div>
        <h3 className="mb-3 font-medium text-neutral-900">price</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            className="w-20 rounded border border-neutral-300 px-2 py-1"
            placeholder="0"
          />
          <span className="text-neutral-400">to</span>
          <input
            type="number"
            min={0}
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="w-20 rounded border border-neutral-300 px-2 py-1"
            placeholder="275"
          />
        </div>
      </div> */}
    </aside>
  );
}
