import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { ScrollToBrowse } from "@/components/ScrollToBrowse";
import { versionedAsset } from "@/lib/assetVersion";

const HERO_CHARACTERS = [
  { name: "Hirono", slug: "hirono" },
  { name: "Sonny", slug: "sonny" },
  { name: "Monchichi", slug: "monchichi" },
  { name: "Labubu", slug: "labubu" },
  { name: "Nyota", slug: "nyota" },
  { name: "Skullpanda", slug: "skullpanda" },
];

export default function Home() {
  const characters = HERO_CHARACTERS.map((character) => ({
    name: character.name,
    slug: character.slug,
    lineArtSrc: versionedAsset(`/images/${character.slug}_color.png`),
    colorSrc: versionedAsset(`/images/${character.slug}.png`),
  }));

  return (
    <ScrollToBrowse>
      <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#fffffc]">
      <Link
        href="/browse"
        className="flex h-full w-full flex-col items-center justify-center gap-4 p-4"
      >
        <HeroSection characters={characters} />
      </Link>

      <div className="absolute inset-0 flex w-full items-center px-8 pl-35 pointer-events-none">
          <span className="pointer-events-auto text-7xl font-medium tracking-tight text-neutral-900 hover:text-[#421B1B]">
            gotcha
          </span>
        </div>
    </main>
    </ScrollToBrowse>
  );
}