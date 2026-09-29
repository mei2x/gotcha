"use client";

import { useState } from "react";

export function LocationEditor({
  initialCity,
  initialState,
  onSave,
}: {
  initialCity: string | null;
  initialState: string | null;
  onSave: (city: string, state: string) => Promise<void>;
}) {
  const [city, setCity] = useState(initialCity ?? "");
  const [state, setState] = useState(initialState ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = city.trim().length > 0 && /^[A-Za-z]{2}$/.test(state);
  const dirty = city !== (initialCity ?? "") || state !== (initialState ?? "");

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(city.trim(), state.toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save location");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="city"
          className="w-28 rounded border border-neutral-300 px-2 py-1 text-sm text-neutral-900"
        />
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 2))}
          placeholder="state"
          className="w-14 rounded border border-neutral-300 px-2 py-1 text-sm uppercase text-neutral-900"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || !dirty || saving}
          className="rounded-full border border-neutral-900 px-3 py-1 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-default disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
        >
          {saving ? "saving…" : "save"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
