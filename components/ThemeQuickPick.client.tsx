"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "sunset", label: "Sunset" }, // your current oranges (default)
  { id: "neon",   label: "Neon"   }, // purple/blue/cyan
  { id: "soda",   label: "Soda"   }, // cyan/mint/pink
];

export default function ThemeQuickPick() {
  const [t, setT] = useState<string>(() =>
    typeof window === "undefined" ? "sunset" : localStorage.getItem("hypeTheme") || "sunset"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("hypeTheme", t);
  }, [t]);

  return (
    <div className="flex flex-wrap gap-2">
      {THEMES.map((x) => (
        <button
          key={x.id}
          type="button"
          onClick={() => setT(x.id)}
          className={`chip ${t === x.id ? "chip-active" : ""}`}
          aria-pressed={t === x.id}
        >
          {x.label}
        </button>
      ))}
    </div>
  );
}