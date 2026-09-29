"use client";

import { useState } from "react";
import type { FavoriteCharacter } from "@/lib/types";

export function FavoriteCharacterBox({
  character,
  onRemove,
}: {
  character: FavoriteCharacter;
  onRemove: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleConfirm() {
    setRemoving(true);
    try {
      await onRemove();
    } finally {
      setRemoving(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-neutral-300 bg-white px-1 text-center text-[11px]">
        <span className="text-neutral-500">remove?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={removing}
            className="font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            {removing ? "…" : "yes"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={removing}
            className="text-neutral-400 hover:text-neutral-700"
          >
            no
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl px-2 text-center text-xs font-medium transition-transform hover:scale-95"
      style={{ backgroundColor: character.color, color: character.textColor }}
    >
      {character.name}
    </button>
  );
}
