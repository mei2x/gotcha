export function StarRating({
  average,
  count,
  label = "your rating",
}: {
  average: number | null;
  count: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <p className="text-sm font-medium text-neutral-900">
        {average !== null ? `${average.toFixed(1)} ★` : "—"}
      </p>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-xs text-neutral-400">
        {count} {count === 1 ? "review" : "reviews"}
      </p>
    </div>
  );
}
