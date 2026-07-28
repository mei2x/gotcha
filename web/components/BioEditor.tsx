"use client";

import { useState } from "react";

export function BioEditor({
  initialBio,
  onSave,
}: {
  initialBio: string | null;
  onSave: (bio: string) => Promise<void>;
}) {
  const [bio, setBio] = useState(initialBio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = bio !== (initialBio ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(bio);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save bio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Tell other collectors about yourself…"
        className="w-full resize-none text-sm text-neutral-700 outline-none placeholder:text-neutral-300"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-neutral-400">bio</p>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-500">{error}</span>}
          {saved && <span className="text-xs text-neutral-400">saved</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="rounded-full border border-neutral-900 px-3 py-1 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-default disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
          >
            {saving ? "saving…" : "save"}
          </button>
        </div>
      </div>
    </div>
  );
}
