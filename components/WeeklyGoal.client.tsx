"use client";

import { useEffect, useState } from "react";
import { getClient } from "@/lib/supabase/client";

export default function WeeklyGoal({ goal = 5 }: { goal?: number }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setCount(0);

      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      // exact count query
      const { count: c } = await supabase
        .from("daily_hypes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", since);

      setCount(c ?? 0);
    };
    run();
  }, []);

  const val = Math.max(0, Math.min(goal, count ?? 0));
  const pct = Math.round((val / goal) * 100);

  return (
    <div className="ui-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-semibold">Weekly goal</div>
        <div className="text-sm opacity-70">{count === null ? "…" : `${val}/${goal}`}</div>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-sm opacity-80">
        {count === null
          ? "Crunching your week…"
          : val >= goal
          ? "Weekly badge unlocked! 🏅"
          : `Just ${goal - val} more to hit ${goal}/5 this week.`}
      </div>
    </div>
  );
}