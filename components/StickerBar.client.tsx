// components/StickerBar.client.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleSticker } from "@/app/actions/stickers";

type Counts = Record<string, number>;
type Reacted = Record<string, boolean>;

const TYPES: { key: string; emoji: string; title: string }[] = [
  { key: "fire",   emoji: "🔥", title: "Fire" },
  { key: "star",   emoji: "💯", title: "100" },
  { key: "trophy", emoji: "🏆", title: "Trophy" },
  { key: "party",  emoji: "🎉", title: "Party" },
  { key: "smile",  emoji: "😊", title: "Smile" },
  { key: "thumb",  emoji: "👍", title: "Thumbs up" },
];

export default function StickerBarClient({
  hypeId,
  userId,
  initial,
  initiallyReacted,
}: {
  hypeId: string;
  userId: string | null;
  initial: Counts;
  initiallyReacted: Reacted;
}) {
  const [pending, start] = useTransition();
  const [counts, setCounts] = useState<Counts>(initial);
  const [reacted, setReacted] = useState<Reacted>(initiallyReacted);

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + (b || 0), 0),
    [counts]
  );

  function onClick(type: string) {
    if (!userId) {
      window.location.href = "/login?next=" + encodeURIComponent(location.pathname);
      return;
    }
    start(async () => {
      // optimistic
      const was = !!reacted[type];
      setReacted((r) => ({ ...r, [type]: !was }));
      setCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] || 0) + (was ? -1 : 1)) }));

      const fd = new FormData();
      fd.set("type", type);
      fd.set("hypeId", hypeId);
      const res = await toggleSticker(fd);
      if (!res?.ok) {
        // rollback if failed
        setReacted((r) => ({ ...r, [type]: was }));
        setCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] || 0) + (was ? 1 : -1)) }));
        // optional toast here
        console.warn("Sticker toggle failed:", res?.error);
      }
    });
  }

  return (
    <div className="mt-2 flex items-center gap-1">
      {TYPES.map(({ key, emoji, title }) => {
        const active = !!reacted[key];
        const c = counts[key] || 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onClick(key)}
            title={title}
            disabled={pending}
            className={`no-tap-highlight inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition
              ${active ? "bg-amber-500 text-black" : "bg-neutral-900 hover:bg-neutral-800 text-white/90"}
              disabled:opacity-60`}
          >
            <span aria-hidden>{emoji}</span>
            {c > 0 && <span className="tabular-nums text-xs">{c}</span>}
          </button>
        );
      })}
      {total > 0 && (
        <span className="ml-2 text-xs opacity-60">{total} total</span>
      )}
    </div>
  );
}