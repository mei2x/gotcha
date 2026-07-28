import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-neutral-200 px-8 py-6 text-sm text-neutral-500">
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
