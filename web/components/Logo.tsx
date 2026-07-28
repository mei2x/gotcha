import Link from "next/link";


export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/browse"
      className={`text-[421B1B] text-3xl font-medium tracking-tight text-neutral-900 ${className}`}
    >
      gotcha.
    </Link>
  );
}
