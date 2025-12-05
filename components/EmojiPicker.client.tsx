"use client";
import { useEffect, useRef, useState } from "react";

const EMOJIS = ["🔥","💯","🎉","🏆","😊","👍","⚽","🏀","🎮","🎵","🌟","🤝","📚","🧠","💪"];

export default function EmojiPicker({
  onPick,
}: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(v => !v)}>
        <span className="mr-1">😊</span> Emoji
      </button>
      {open && (
        <div ref={boxRef} className="menu-surface absolute right-0 mt-2 w-56 p-2 grid grid-cols-8 gap-1">
          {EMOJIS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => { onPick(e); setOpen(false); }}
              className="h-8 w-8 rounded-md bg-neutral-900 hover:bg-neutral-800"
              title={e}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}