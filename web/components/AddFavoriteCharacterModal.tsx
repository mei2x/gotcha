"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import type { Character } from "@/lib/types";

const DEFAULT_COLOR = "#F2C9E0";
const DEFAULT_TEXT_COLOR = "#171717";

export function AddFavoriteCharacterModal({
  characters,
  excludeIds,
  onAdd,
  onClose,
}: {
  characters: Character[];
  excludeIds: Set<string>;
  onAdd: (characterId: string, color: string, textColor: string) => Promise<void>;
  onClose: () => void;
}) {
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = characters.filter((c) => !excludeIds.has(c.id));
  const selected = available.find((c) => c.id === characterId) ?? null;

  async function handleAdd() {
    if (!characterId) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd(characterId, color, textColor);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add favorite");
      setSaving(false);
    }
  }

  return (
    <Modal title="Add a favorite character" onClose={onClose}>
      {!selected ? (
        <div className="grid max-h-80 grid-cols-3 gap-3 overflow-y-auto">
          {available.length === 0 ? (
            <p className="col-span-3 text-sm text-neutral-400">
              You&apos;ve already favorited every character.
            </p>
          ) : (
            available.map((character) => (
              <button
                key={character.id}
                type="button"
                onClick={() => setCharacterId(character.id)}
                className="rounded-xl border border-neutral-200 p-3 text-center text-xs lowercase text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
              >
                {character.name}
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl px-2 text-center text-xs font-medium"
            style={{ backgroundColor: color, color: textColor }}
          >
            {selected.name}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 text-sm text-neutral-600">
              box color
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-neutral-300 bg-transparent p-0.5"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-neutral-600">
              text color
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-neutral-300 bg-transparent p-0.5"
              />
            </label>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={() => setCharacterId(null)}
              disabled={saving}
              className="flex-1 rounded-full border border-neutral-300 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
            >
              back
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 rounded-full bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
            >
              {saving ? "adding…" : "add"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
