"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StreakChip() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function calcStreak() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setStreak(null);

      const { data } = await supabase
        .from("daily_hypes")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(120);

      const rows = (data ?? []) as { created_at: string }[];
      const days = new Set(
        rows.map(r => new Date(r.created_at).toISOString().slice(0, 10))
      );

      const today = new Date();
      let s = 0;
      for (let i = 0; i < 90; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (days.has(key)) s++;
        else {
          if (i === 0) continue; // don't break chain if today's not posted yet
          break;
        }
      }
      setStreak(s);
    }

    calcStreak();
    const onFocus = () => calcStreak();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (streak == null) return null;

  return (
    <div className="rounded-full px-3 py-1 bg-neutral-900/60 text-sm">
      🔥 Streak {streak}
    </div>
  );
}