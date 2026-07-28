import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
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
    <main className="flex flex-1 flex-col">
      <Link
        href="/browse"
        className="flex flex-1 flex-col items-center justify-center gap-4 px-8 p-24"
      >
        <HeroSection
          characters={characters}
          clawUpSrc={versionedAsset("/images/claw_up.png")}
          clawDownSrc={versionedAsset("/images/claw_down.png")}
        />

        <div className="flex items-center justify-center -ml-240">
          <span className="text-7xl font-medium tracking-tight text-neutral-900 hover:text-[#421B1B]">
            gotcha.
          </span>
        </div>
      </Link>
    </main>
  );
}
