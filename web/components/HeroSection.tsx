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

// claw_up.png is a 2940x1524 canvas that's almost entirely blank; the
// actual claw art is a small graphic at roughly x:1094-1318, y:0-326
// within it. These are its bounds, rendered at natural aspect ratio and
// scaled by CLAW_SCALE, used to hang the artwork's own bottom tip (not
// the mostly-empty canvas) right at the character's top edge.
const CLAW_SCALE = 1420 / 2940;
const CLAW_RENDER_WIDTH = 2940 * CLAW_SCALE; // 1420
const CLAW_RENDER_HEIGHT = 1524 * CLAW_SCALE;
const ART_CENTER_X = ((1094 + 1318) / 2) * CLAW_SCALE;
const ART_BOTTOM_Y = 326 * CLAW_SCALE;
// Where that same point ends up after a 180deg rotation + horizontal flip
// (equivalent to a vertical flip around the rendered image's center),
// used to hang the bottom row's claws off the character's bottom edge.
const ART_BOTTOM_Y_FLIPPED = CLAW_RENDER_HEIGHT - ART_BOTTOM_Y;
// How far past the character's edge the claw's tip should reach so the hook
// actually lands on the character (head for the top row, feet for the
// bottom row) instead of stopping right at the edge.
const CLAW_DROP = 64;

export function HeroSection({
  characters,
}: {
  characters: CharacterAssets[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative grid w-full max-w-3xl grid-cols-3 gap-x-1 gap-y-8 sm:gap-x-10 -mr-90">
      {characters.map((character, i) => {
        const gridColumn = (i % 3) + 1;
        const gridRow = Math.floor(i / 3) + 1;
        // Bottom row's claws are rotated/mirrored to look like they're
        // closing in from below instead of hanging from above.
        const isBottomRow = i >= 3;

        return (
          <div key={character.slug} className="relative" style={{ gridColumn, gridRow }}>
            <HeroCharacter
              name={character.name}
              lineArtSrc={character.lineArtSrc}
              colorSrc={character.colorSrc}
              className="aspect-square w-full"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            {/* claw_up disabled for now — claw only appears while this
                exact character is hovered, showing claw_down. */}
            {hovered === i && (
              <div
                className="pointer-events-none absolute"
                style={
                  isBottomRow
                    ? {
                        left: "50%",
                        top: "100%",
                        width: `${CLAW_RENDER_WIDTH}px`,
                        height: `${CLAW_RENDER_HEIGHT}px`,
                        transform: `translate(${-ART_CENTER_X}px, ${-ART_BOTTOM_Y_FLIPPED - CLAW_DROP}px) rotate(180deg) scaleX(-1)`,
                      }
                    : {
                        left: "50%",
                        top: "0%",
                        width: `${CLAW_RENDER_WIDTH}px`,
                        height: `${CLAW_RENDER_HEIGHT}px`,
                        transform: `translate(${-ART_CENTER_X}px, ${-ART_BOTTOM_Y + CLAW_DROP}px)`,
                      }
                }
              >
                <Image
                  src="/images/claw_down.png"
                  alt=""
                  aria-hidden
                  fill
                  unoptimized
                  className="object-contain opacity-70"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
