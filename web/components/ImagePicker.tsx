"use client";

import { useEffect, useRef, useState } from "react";

export function ImagePicker({
  images,
  onChange,
  maxImages = 6,
}: {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next = [...images, ...Array.from(fileList)].slice(0, maxImages);
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  if (previews.length === 0) {
    return (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-500"
      >
        <span className="text-2xl">+</span>
        <span>add pictures</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previews[0]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={src} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-[10px] text-white"
            >
              ×
            </button>
          </div>
        ))}
        {previews.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400"
          >
            +
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
