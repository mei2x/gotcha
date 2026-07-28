export function CharacterPlaceholder({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center text-xs text-neutral-400 ${className}`}
      title={`Placeholder for ${name} — swap in real art`}
    >
      {name}
    </div>
  );
}
