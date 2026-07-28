const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function MiniCalendar({ date }: { date: Date }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-neutral-700">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400">
        {DAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((day, i) =>
          day === null ? (
            <span key={i} />
          ) : (
            <span
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                day === date.getDate()
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600"
              }`}
            >
              {day}
            </span>
          )
        )}
      </div>
    </div>
  );
}
