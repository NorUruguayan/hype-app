"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function startOfTodayLocalISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString(); // UTC ISO for .gte() filter
}
function msUntilMidnight(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime() - Date.now();
}
function fmtMMSS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(m)}:${pad(s)}`;
}

type Mode = "none" | "dot" | "chip" | "urgent";

export default function HeaderDeadlineHint({
  thresholdMinutes = 120, // when to start showing nudges
}: {
  thresholdMinutes?: number;
}) {
  const [leftMs, setLeftMs] = useState(msUntilMidnight());
  const [hasToday, setHasToday] = useState<boolean>(false);

  // tick countdown every second
  useEffect(() => {
    const t = setInterval(() => setLeftMs(msUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  // check “did post today?” on mount and every 60s
  useEffect(() => {
    const supabase = createClient();

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setHasToday(false);

      const { count } = await supabase
        .from("daily_hypes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfTodayLocalISO());

      setHasToday(!!count && count > 0);
    }

    check();
    const t = setInterval(check, 60_000);
    const sub = supabase.auth.onAuthStateChange(() => check());
    return () => {
      clearInterval(t);
      sub.data?.subscription?.unsubscribe();
    };
  }, []);

  const mode: Mode = useMemo(() => {
    if (hasToday) return "none";
    const minsLeft = leftMs / 60_000;
    if (minsLeft > thresholdMinutes) return "none";
    if (minsLeft <= 15) return "urgent";
    if (minsLeft <= 60) return "chip";
    return "dot";
  }, [leftMs, hasToday, thresholdMinutes]);

  if (mode === "none") return null;

  const title = `Time left today: ${fmtMMSS(leftMs)}`;

  if (mode === "dot") {
    return (
      <span
        className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-400 ring-2 ring-black/50 animate-pulse"
        title={title}
        aria-label={title}
      />
    );
  }

  // chip / urgent
  const urgent = mode === "urgent";
  return (
    <span
      className={[
        "ml-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
        urgent
          ? "bg-red-500/90 text-black"
          : "bg-amber-400/90 text-black",
      ].join(" ")}
      title={title}
      aria-label={title}
    >
      {urgent ? "🔥" : "⏳"} {fmtMMSS(leftMs)}
    </span>
  );
}