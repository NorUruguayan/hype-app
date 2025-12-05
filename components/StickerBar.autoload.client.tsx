// components/StickerBar.autoload.client.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
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

export default function StickerBar({ hypeId }: { hypeId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [pending, start] = useTransition();
  const [userId, setUserId] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [reacted, setReacted] = useState<Reacted>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [{ data: u }, { data: c }] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("sticker_reaction_counts")
            .select("type, count")
            .eq("hype_id", hypeId),
        ]);

        if (cancelled) return;
        setUserId(u?.user?.id ?? null);

        const initialCounts: Counts = {};
        for (const t of TYPES) initialCounts[t.key] = 0;
        for (const row of c ?? []) initialCounts[row.type as string] = row.count as number;
        setCounts(initialCounts);

        // Which of mine?
        const reactedMap: Reacted = {};
        for (const t of TYPES) reactedMap[t.key] = false;

        if (u?.user?.id) {
          const { data: mine } = await supabase
            .from("sticker_reactions")
            .select("type")
            .eq("hype_id", hypeId)
            .eq("user_id", u.user.id);
          for (const r of mine ?? []) reactedMap[r.type as string] = true;
        }
        setReacted(reactedMap);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [supabase, hypeId]);

  function onClick(type: string) {
    if (!userId) {
      window.location.href = "/login?next=" + encodeURIComponent(location.pathname);
      return;
    }
    start(async () => {
      const was = !!reacted[type];
      setReacted((r) => ({ ...r, [type]: !was }));
      setCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] || 0) + (was ? -1 : 1)) }));

      const fd = new FormData();
      fd.set("type", type);
      fd.set("hypeId", hypeId);
      const res = await toggleSticker(fd);
      if (!res?.ok) {
        setReacted((r) => ({ ...r, [type]: was }));
        setCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] || 0) + (was ? 1 : -1)) }));
        console.warn("Sticker toggle failed:", res?.error);
      }
    });
  }

  if (!loaded) {
    return (
      <div className="mt-2 flex items-center gap-1">
        {TYPES.map(({ key }) => (
          <span key={key} className="inline-block h-6 w-10 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
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
    </div>
  );
}