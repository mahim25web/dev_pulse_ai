"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

import { fileToImage, type PickedImage } from "@/lib/image";

interface Props {
  value: PickedImage | null;
  onChange: (image: PickedImage | null) => void;
}

export function ImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      onChange(await fileToImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that image.");
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value.preview} alt="Uploaded screenshot preview" className="h-14 w-20 rounded-md border border-slate-800 object-cover" />
        <p className="min-w-0 flex-1 truncate text-sm text-slate-300">{value.name}</p>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove screenshot"
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files[0]);
        }}
        className={
          "flex w-full items-center justify-center gap-2.5 rounded-lg border border-dashed px-4 py-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 " +
          (dragging
            ? "border-indigo-400 bg-indigo-500/10 text-indigo-200"
            : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200")
        }
      >
        <ImagePlus className="h-4 w-4" aria-hidden />
        Drop a screenshot, click to browse, or paste into the box above
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
