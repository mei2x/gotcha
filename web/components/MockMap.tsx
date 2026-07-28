export function MockMap({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      role="img"
      aria-label="Map showing the pick-up location"
    >
      <rect width="300" height="300" fill="#eef0eb" />
      <g stroke="#d7dad0" strokeWidth="10">
        <line x1="0" y1="70" x2="300" y2="70" />
        <line x1="0" y1="180" x2="300" y2="180" />
        <line x1="60" y1="0" x2="60" y2="300" />
        <line x1="210" y1="0" x2="210" y2="300" />
      </g>
      <g stroke="#e4e6df" strokeWidth="5">
        <line x1="0" y1="230" x2="300" y2="230" />
        <line x1="140" y1="0" x2="140" y2="300" />
      </g>
      <g transform="translate(150,140)">
        <path
          d="M0 -34c14 0 24 10 24 24 0 17-24 40-24 40s-24-23-24-40c0-14 10-24 24-24Z"
          fill="#171717"
        />
        <circle cx="0" cy="-10" r="8" fill="#fffffc" />
      </g>
    </svg>
  );
}
