"use client";

import { useState } from "react";
import Image from "next/image";
import { HeroCharacter } from "./HeroCharacter";

type CharacterAssets = {
  name: string;
  slug: string;
  lineArtSrc: string;
  colorSrc: string;
};

// Claw i is pinned to the same grid cell as character i (top row 0-2,
// bottom row 3-5) via explicit grid placement, so it always overlaps its
// character regardless of viewport size. The bottom row's claws are
// rotated/mirrored to look like they're closing in from below.
const CLAW_VARIANTS = [
  "",
  "",
  "",
  "rotate-180 scale-x-[-1]",
  "rotate-180 scale-x-[-1]",
  "rotate-180 scale-x-[-1]",
];

export function HeroSection({
  characters,
  clawUpSrc,
  clawDownSrc,
}: {
  characters: CharacterAssets[];
  clawUpSrc: string;
  clawDownSrc: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative grid w-full max-w-3xl grid-cols-3 gap-x-1 gap-y-8 sm:gap-x-10">
      {characters.map((character, i) => (
        <div
          key={character.slug}
          style={{ gridColumn: (i % 3) + 1, gridRow: Math.floor(i / 3) + 1 }}
        >
          <HeroCharacter
            name={character.name}
            lineArtSrc={character.lineArtSrc}
            colorSrc={character.colorSrc}
            className="aspect-square w-full"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        </div>
      ))}
      {CLAW_VARIANTS.map((variant, i) => (
        <div
          key={i}
          className="pointer-events-none relative aspect-square w-full"
          style={{ gridColumn: (i % 3) + 1, gridRow: Math.floor(i / 3) + 1 }}
        >
          <div className={`absolute -inset-[20%] ${variant}`}>
            <Image
              src={hovered === i ? clawDownSrc : clawUpSrc}
              alt=""
              aria-hidden
              fill
              unoptimized
              className="object-contain opacity-70"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
