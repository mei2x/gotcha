"use client";

import Image from "next/image";

export function HeroCharacter({
  name,
  lineArtSrc,
  colorSrc,
  className = "",
  onMouseEnter,
  onMouseLeave,
}: {
  name: string;
  lineArtSrc: string;
  colorSrc: string;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div
      className={`group relative flex items-center justify-center ${className}`}
      title={name}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Image
        src={lineArtSrc}
        alt={name}
        fill
        unoptimized
        className="object-contain transition-opacity duration-300 group-hover:opacity-0"
        sizes="200px"
      />
      <Image
        src={colorSrc}
        alt=""
        aria-hidden
        fill
        unoptimized
        className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        sizes="200px"
      />
    </div>
  );
}
