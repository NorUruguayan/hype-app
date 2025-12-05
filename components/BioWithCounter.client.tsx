// components/BioWithCounter.client.tsx
"use client";

import { useState } from "react";

export default function BioWithCounter({ defaultValue = "" }: { defaultValue?: string }) {
  const MAX = 160;
  const [val, setVal] = useState(defaultValue);

  return (
    <div>
      <textarea
        name="bio"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        maxLength={MAX}
        placeholder="Tell people what you’re hyped about…"
        className="w-full min-h-28 resize-y rounded-xl bg-white/5 border border-white/10 px-3 py-2"
      />
      <div className="text-xs opacity-60 mt-1">
        {val.length}/{MAX}
      </div>
    </div>
  );
}