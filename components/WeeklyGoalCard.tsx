// components/WeeklyGoalCard.tsx
import { getServerClient } from "@/lib/supabase/server";

function startOfWeekLocal(): Date {
  const d = new Date();
  // Mon=0 … Sun=6
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export default async function WeeklyGoalCard({
  target = 4, // simple default target (can make user-configurable later)
}: { target?: number }) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const weekStart = startOfWeekLocal().toISOString();

  // Count this week's daily hypes
  const { count } = await supabase
    .from("daily_hypes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", weekStart);

  const done = count ?? 0;
  const pct = Math.max(0, Math.min(1, done / target));

  const label =
    done >= target
      ? "Weekly goal hit — amazing!"
      : done === 0
      ? "Crunching your week… let’s start!"
      : `Nice — ${target - done} to go`;

  return (
    <section className="ui-card p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="font-semibold">Weekly goal</div>
        <div className="opacity-70">
          {done}/{target}
        </div>
      </div>

      <div className="progress mb-1">
        <div
          className="progress-bar"
          style={{ width: `${pct * 100}%` }}
          aria-hidden
        />
      </div>

      <div className="text-xs opacity-75">{label}</div>
    </section>
  );
}