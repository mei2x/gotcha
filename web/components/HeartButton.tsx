"use client";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-10-9.1C.4 8 1.9 4.5 5.2 3.7c2-.5 4 .3 5.1 2 .4.6.6.9.7 1.1.1-.2.3-.5.7-1.1 1.1-1.7 3.1-2.5 5.1-2 3.3.8 4.8 4.3 3.2 7.7-2.5 4.5-10 9.1-10 9.1Z"
      />
    </svg>
  );
}

export function HeartButton({
  liked,
  disabled,
  onToggle,
}: {
  liked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      className={`transition-colors ${
        liked ? "text-red-500" : "text-neutral-300 hover:text-neutral-500"
      } disabled:cursor-default disabled:opacity-50`}
    >
      <HeartIcon filled={liked} />
    </button>
  );
}
