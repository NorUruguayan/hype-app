// components/StreakHeatmap.client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = { userId: string; weeks?: number };

type DayMap = Record<string, number>; // YYYY-MM-DD => count

const AMBER = ["#171717", "#3f2e12", "#7c4d0b", "#f59e0b"]; // off → hot

export default function StreakHeatmap({ userId, weeks = 8 }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [days, setDays] = useState<DayMap>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Build range (local time)
  const today = new Date(); today.setHours(0,0,0,0);
  const mondayOffset = ((today.getDay() + 6) % 7); // Monday = 0
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1) - mondayOffset);

  const rangeLabel = `${fmtDate(start)} – ${fmtDate(today)}`;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("daily_hypes")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", start.toISOString())
          .order("created_at", { ascending: false })
          .limit(730);

        if (error) throw error;

        const map: DayMap = {};
        for (const r of (data ?? [])) {
          const k = dayKey(new Date(r.created_at));
          map[k] = (map[k] ?? 0) + 1;
        }
        if (!cancelled) setDays(map);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, userId]);

  // Compute current streak (consecutive days from today backwards)
  const streak = (() => {
    let d = new Date(today);
    let s = 0;
    while (days[dayKey(d)]) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  })();

  // Build grid data
  const cells: { date: Date; key: string; hot: number }[] = [];
  const iter = new Date(start);
  for (let i = 0; i < weeks * 7; i++) {
    const k = dayKey(iter);
    const count = days[k] ?? 0;
    cells.push({ date: new Date(iter), key: k, hot: Math.min(3, count) });
    iter.setDate(iter.getDate() + 1);
  }

  return (
    <div className="ui-card p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Your streak</div>
        <div className="text-xs opacity-70">{rangeLabel}</div>
      </div>

      <div className="mt-3 flex gap-3 items-start">
        {/* Heatmap / skeleton / empty */}
        <div className="min-h-[70px]">
          {loading ? (
            <SkeletonGrid weeks={weeks} />
          ) : Object.keys(days).length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
              {Array.from({ length: weeks }).map((_, col) => (
                <div key={col} className="grid grid-rows-7 gap-[3px] mr-[3px]">
                  {Array.from({ length: 7 }).map((__, row) => {
                    const idx = col * 7 + row;
                    const c = cells[idx];
                    return (
                      <div
                        key={idx}
                        title={`${fmtDate(c.date)} • ${days[c.key] ? "Posted" : "No post"}`}
                        className="h-3 w-3 rounded-[3px]"
                        style={{ background: AMBER[c.hot] }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend + stat */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm">
            <div className="text-xl font-bold">{streak}d</div>
            <div className="opacity-70 text-xs">current streak</div>
          </div>
          <div className="flex items-center gap-1 text-xs opacity-70">
            <span className="inline-block h-3 w-3 rounded-[3px]" style={{ background: AMBER[0] }} />
            <span>→</span>
            <span className="inline-block h-3 w-3 rounded-[3px]" style={{ background: AMBER[3] }} />
            <span>more hype</span>
          </div>
        </div>
      </div>

      {err && <div className="mt-3 text-xs text-red-400">Error: {err}</div>}
    </div>
  );
}

function SkeletonGrid({ weeks }: { weeks: number }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
      {Array.from({ length: weeks }).map((_, col) => (
        <div key={col} className="grid grid-rows-7 gap-[3px] mr-[3px]">
          {Array.from({ length: 7 }).map((__, row) => (
            <div
              key={row}
              className="h-3 w-3 rounded-[3px] bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-sm opacity-80">
      No streak yet — post today to start your streak. 🔥
    </div>
  );
}

function dayKey(d: Date) {
  // local YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}