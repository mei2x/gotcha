import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 px-4 py-6 text-sm text-neutral-500 sm:px-8">
      <div className="flex items-center gap-6">
        <Link href="/terms" className="hover:text-neutral-900">
          Terms and Support
        </Link>
        <Link href="/privacy" className="hover:text-neutral-900">
          Privacy Policy
        </Link>
      </div>
      <span className="font-medium text-neutral-900">gotcha.</span>
    </footer>
  );
}
