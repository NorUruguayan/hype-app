"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Cell = { date: string; lit: boolean };

export default function StreakGrid() {
  const supabase = useMemo(() => createClient(), []);
  const [cells, setCells] = useState<Cell[]>([]);
  const [streak, setStreak] = useState(0);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (!uid) {
          setCells(makeCells(new Set(), 70));
          setStreak(0);
          setRange(calcRange(70));
          return;
        }

        // last ~120 days (more than we render)
        const { data } = await supabase
          .from("daily_hypes")
          .select("created_at")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(120);

        const days = new Set<string>(
          (data ?? []).map((r) => new Date(r.created_at).toISOString().slice(0, 10))
        );

        const c = makeCells(days, 70);
        const s = calcStreak(days);
        const r = calcRange(70);

        if (!dead) {
          setCells(c);
          setStreak(s);
          setRange(r);
        }
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, [supabase]);

  return (
    <div className="ui-card p-4">
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium">Your streak</div>
        {range && (
          <div className="text-xs opacity-60">{formatRange(range.start, range.end)}</div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-[repeat(10,12px)] gap-1">
        {loading
          ? Array.from({ length: 70 }).map((_, i) => (
              <span key={i} className="h-3 w-3 rounded-sm bg-white/5 animate-pulse" />
            ))
          : cells.map((c) => (
              <span
                key={c.date}
                title={c.date}
                className={`h-3 w-3 rounded-sm ${
                  c.lit ? "bg-amber-500/90" : "bg-white/10"
                }`}
              />
            ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div><span className="inline-block h-2 w-3 rounded-sm bg-white/10" /> <span className="opacity-60">less</span></div>
        <div className="font-semibold">{streak}d</div>
        <div><span className="inline-block h-2 w-3 rounded-sm bg-amber-500/90" /> <span className="opacity-60">more hype</span></div>
      </div>
    </div>
  );
}

function makeCells(days: Set<string>, n: number): Cell[] {
  const out: Cell[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, lit: days.has(key) });
  }
  return out;
}

function calcStreak(days: Set<string>): number {
  let s = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

function calcRange(n: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function formatRange(a: string, b: string) {
  const A = new Date(a), B = new Date(b);
  const fmt = (d: Date) =>
    d.toLocaleString(undefined, { month: "short", day: "numeric" });
  return `${fmt(A)} – ${fmt(B)}`;
}