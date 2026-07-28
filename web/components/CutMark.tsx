export function CutMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 6c8 2 14 8 16 14M20 20c2-6 8-12 16-14M20 20c-2 6-1 12 2 16M20 20c-3 2-8 2-12 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
