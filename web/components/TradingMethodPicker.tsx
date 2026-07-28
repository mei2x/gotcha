"use client";

import { useState } from "react";

const OPTIONS: { value: string; label: string }[] = [
  { value: "shipping", label: "shipping" },
  { value: "in_person", label: "in-person trade" },
];

export function TradingMethodPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (method: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(method: string) {
    if (method === value) return;
    setSaving(method);
    setError(null);
    try {
      await onChange(method);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={saving !== null}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              value === option.value
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
            }`}
          >
            {saving === option.value ? "saving…" : option.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
