"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadAvatar, resolveAvatarUrl } from "@/lib/authApi";
import type { User } from "@/lib/types";

export function AvatarUpload({
  avatarUrl,
  onUploaded,
}: {
  avatarUrl: string | null;
  onUploaded: (user: User) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const updated = await uploadAvatar(file);
      onUploaded(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const resolved = resolveAvatarUrl(avatarUrl);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-60 w-60 items-center justify-center overflow-hidden rounded-full border border-neutral-200 text-xs text-neutral-300 transition-opacity hover:opacity-80"
      >
        {resolved ? (
          <Image src={resolved} alt="Your avatar" fill unoptimized className="object-cover" />
        ) : (
          <span>avatar</span>
        )}
        <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-xs text-white group-hover:flex">
          {uploading ? "uploading…" : "change"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
