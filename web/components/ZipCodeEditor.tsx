"use client";

import { useState } from "react";

export function ZipCodeEditor({
  initialZip,
  onSave,
}: {
  initialZip: string | null;
  onSave: (zip: string) => Promise<void>;
}) {
  const [zip, setZip] = useState(initialZip ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = /^\d{5}$/.test(zip);
  const dirty = zip !== (initialZip ?? "");

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(zip);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save zip code");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="90001"
          className="w-24 rounded border border-neutral-300 px-2 py-1 text-sm text-neutral-900"
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
      {zip.length > 0 && !isValid && (
        <p className="mt-1 text-xs text-red-500">Zip code must be 5 digits</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
