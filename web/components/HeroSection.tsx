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

// Matches the 3x2 hero grid: first 3 entries sit over the top row, the
// rotated/mirrored 3 sit over the bottom row.
const CLAW_POSITIONS = [
  "pointer-events-none absolute -top-110 -left-119 w-355 h-355",
  "pointer-events-none absolute -top-110 -left-50 w-355 h-355",
  "pointer-events-none absolute -top-110 -right-178 w-355 h-355",
  "pointer-events-none rotate-180 scale-x-[-1] absolute -top-122 -left-116 w-355 h-355",
  "pointer-events-none rotate-180 scale-x-[-1] absolute -top-122 -left-50 w-355 h-355",
  "pointer-events-none rotate-180 scale-x-[-1] absolute -top-122 -right-182 w-355 h-355",
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
    <div className="relative grid w-full max-w-3xl grid-cols-3 gap-x-1 gap-y-8 sm:gap-x-10 -mr-70">
      {CLAW_POSITIONS.map((positionClassName, i) => (
        <div key={i} className={positionClassName}>
          <Image
            src={hovered === i ? clawDownSrc : clawUpSrc}
            alt=""
            aria-hidden
            fill
            unoptimized
            className="object-contain opacity-70"
          />
        </div>
      ))}
      {characters.map((character, i) => (
        <HeroCharacter
          key={character.slug}
          name={character.name}
          lineArtSrc={character.lineArtSrc}
          colorSrc={character.colorSrc}
          className="aspect-square w-full"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}
    </div>
  );
}
