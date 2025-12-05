// components/AvatarPreview.client.tsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * File input with live preview.
 * - Emits a standard <input type="file" name={inputName} />
 * - No external libs, no uploads here (server action handles upload).
 */
export default function AvatarPreview({ inputName }: { inputName: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="h-14 w-14 overflow-hidden rounded-xl ring-1 ring-white/10 bg-white/5 grid place-items-center">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="New avatar preview" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs opacity-60">No image</span>
        )}
      </div>

      <label className="btn-ghost cursor-pointer">
        Choose file
        <input
          type="file"
          name={inputName}
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            if (!f) {
              setSrc(null);
              return;
            }
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
            const url = URL.createObjectURL(f);
            urlRef.current = url;
            setSrc(url);
          }}
        />
      </label>

      {src && (
        <button type="button" className="btn-ghost" onClick={() => setSrc(null)}>
          Clear
        </button>
      )}
    </div>
  );
}