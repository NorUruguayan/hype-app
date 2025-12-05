// components/KeepStreakNudge.client.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  userId: string;
  /** ISO strings of daily_hypes.created_at */
  timestamps: string[];
};

/* ---------- time helpers (local) ---------- */
function startOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function nextMidnightLocalMs(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}
function fmtCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function KeepStreakNudgeClient({ userId, timestamps }: Props) {
  const pathname = usePathname();

  // Always declare hooks in the same order (no early return above).
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [dismissedOn, setDismissedOn] = useState<string | null>(null);

  const snoozeKey = `streak-nudge:snoozeUntil:${userId}`;
  const dismissedKey = `streak-nudge:dismissedOn:${userId}`;

  // Client-only effects
  useEffect(() => {
    setMounted(true);

    // hydrate localStorage state (client only)
    try {
      const s = localStorage.getItem(snoozeKey);
      const d = localStorage.getItem(dismissedKey);
      setSnoozeUntil(s ? Number(s) : null);
      setDismissedOn(d || null);
    } catch {
      /* ignore */
    }

    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build a set of local "YYYY-MM-DD" days from timestamps (client only).
  const daysSet = useMemo(() => {
    if (!mounted) return new Set<string>();
    const set = new Set<string>();
    for (const iso of timestamps) {
      const d = new Date(iso);
      // convert to local day key
      const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      set.add(localMidnight.toISOString().slice(0, 10));
    }
    return set;
  }, [timestamps, mounted]);

  const todayKey = useMemo(
    () => (mounted ? startOfTodayLocal().toISOString().slice(0, 10) : ""),
    [mounted]
  );
  const hasToday = mounted && daysSet.has(todayKey);

  // Compute current streak length (contiguous back from today or yesterday).
  const streak = useMemo(() => {
    if (!mounted) return 0;
    let count = 0;
    const offsetStart = hasToday ? 0 : 1; // allow missing today
    for (let i = offsetStart; i < 90; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (daysSet.has(key)) count++;
      else break;
    }
    return count;
  }, [daysSet, hasToday, mounted]);

  // Action handlers
  const snooze = (hours = 6) => {
    const until = Date.now() + hours * 3600 * 1000;
    try {
      localStorage.setItem(snoozeKey, String(until));
    } catch {}
    setSnoozeUntil(until);
  };
  const dismissToday = () => {
    try {
      localStorage.setItem(dismissedKey, todayKey);
    } catch {}
    setDismissedOn(todayKey);
  };

  // ---- Render guards (after hooks are declared) ----

  // Don’t show on /daily composer page
  const onComposer = pathname?.startsWith("/daily");

  // Wait until mounted so everything (timezone, countdown, localStorage) is client-only.
  if (!mounted || onComposer) return null;

  // Hide if snoozed/dismissed or already posted today
  if ((snoozeUntil && now < snoozeUntil) || dismissedOn === todayKey || hasToday) return null;

  const countdown = fmtCountdown(nextMidnightLocalMs() - now);
  const streakText = streak > 0 ? `You’re on a ${streak}-day streak.` : `Start your streak today!`;

  return (
    <div className="ui-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="text-base font-semibold">Keep your streak 🔥</div>
        <div className="text-sm opacity-80">
          {streakText} You have{" "}
          <span className="font-medium" suppressHydrationWarning>
            {countdown}
          </span>{" "}
          left today.
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/daily"
          className="rounded-lg px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium"
        >
          Post today’s hype
        </Link>
        <button
          type="button"
          onClick={() => snooze(6)}
          className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          Snooze 6h
        </button>
        <button
          type="button"
          onClick={dismissToday}
          className="rounded-lg px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-sm"
        >
          Dismiss today
        </button>
      </div>
    </div>
  );
}