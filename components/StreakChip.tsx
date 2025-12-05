// components/StreakChip.tsx
import { getServerClient } from "@/lib/supabase/server";

export default async function StreakChip() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // fetch last 35 days of daily entries (adjust table/column names as needed)
  const { data } = await supabase
    .from("daily_hypes")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const days = new Set(
    (data ?? []).map((r) => new Date(r.created_at).toISOString().slice(0, 10))
  );

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else {
      // allow missing today only if there are none yet today:
      if (i === 0) continue;
      break;
    }
  }

  return (
    <div className="rounded-full px-3 py-1 bg-neutral-900/60 text-sm">
      🔥 Streak {streak}
    </div>
  );
}