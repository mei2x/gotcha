"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Character } from "@/lib/types";

export function CharacterAutocomplete({
  characters,
  value,
  onChange,
}: {
  characters: Character[];
  value: string;
  onChange: (characterId: string) => void;
}) {
  const selected = characters.find((c) => c.id === value) ?? null;
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selected?.name ?? "");
  }, [selected?.id, selected?.name]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(selected?.name ?? "");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [selected?.name]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) => c.name.toLowerCase().includes(q));
  }, [characters, query]);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        required
        placeholder="character"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="w-full rounded border border-neutral-300 px-2 py-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-300"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-neutral-300 bg-white text-sm shadow-sm">
          {matches.map((character) => (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(character.id);
                  setQuery(character.name);
                  setOpen(false);
                }}
                className="block w-full px-2 py-1 text-left text-neutral-900 hover:bg-neutral-100"
              >
                {character.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
