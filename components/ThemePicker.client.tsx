// components/ThemePicker.client.tsx
"use client";

import { useEffect, useId, useState } from "react";

type Props = {
  name?: string;           // defaults "pref_theme"
  defaultValue?: "system" | "light" | "dark";
};

export default function ThemePicker({ name = "pref_theme", defaultValue = "system" }: Props) {
  const [choice, setChoice] = useState<"system" | "light" | "dark">(defaultValue);
  const id = useId();

  // reflect immediately (optional): add a class on <html> to preview
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    if (choice !== "system") html.classList.add(choice);
  }, [choice]);

  const Item = ({ val, label }: { val: "system" | "light" | "dark"; label: string }) => (
    <label className={`inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm cursor-pointer ring-1 ring-white/12 mr-2 ${choice === val ? "bg-white/10" : "bg-white/5 hover:bg-white/8"}`}>
      <input
        type="radio"
        name={`${id}-theme-visible`}
        checked={choice === val}
        onChange={() => setChoice(val)}
        className="sr-only"
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div>
      {/* hidden input that the server action reads */}
      <input type="hidden" name={name} value={choice} />
      <div className="mb-2 text-sm opacity-80">Theme</div>
      <div>
        <Item val="system" label="System" />
        <Item val="light" label="Light" />
        <Item val="dark" label="Dark" />
      </div>
      <p className="text-xs opacity-60 mt-1">Applies instantly. We’ll remember your choice.</p>
    </div>
  );
}