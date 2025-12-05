// lib/streaks.ts
import { getServerClient } from "@/lib/supabase/server";

export type StreakInfo = {
  streak: number;               // consecutive days (ends today if hyped today, otherwise ends yesterday)
  hasHypedToday: boolean;       // whether there's a hype today
  lastHypeDate: string | null;  // ISO string or null
};

/**
 * Computes a user's daily hype streak from the last N days of `hypes`.
 * Uses UTC day boundaries for simplicity (consistent on server).
 */
export async function getStreakForUser(
  userId: string,
  daysToLookBack = 60
): Promise<StreakInfo> {
  const supabase = await getServerClient();

  const since = new Date();
  since.setDate(since.getDate() - daysToLookBack);

  const { data, error } = await supabase
    .from("hypes")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    // If anything fails, treat it like no streak data
    return { streak: 0, hasHypedToday: false, lastHypeDate: null };
  }

  // Bucket each hype by day (UTC)
  const days = new Set<string>();
  for (const row of data ?? []) {
    const d = new Date(row.created_at);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    days.add(key);
  }

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const hasHypedToday = days.has(todayKey);

  // Walk backward day-by-day to count consecutive days
  let streak = 0;
  let cursor = new Date(today);

  if (hasHypedToday) {
    // Streak ending today
    streak = 1;
    for (let i = 1; i < daysToLookBack; i++) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      if (days.has(cursor.toISOString().slice(0, 10))) streak++;
      else break;
    }
  } else {
    // Streak (if any) ending yesterday
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (days.has(cursor.toISOString().slice(0, 10))) {
      streak = 1;
      for (let i = 2; i <= daysToLookBack; i++) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        if (days.has(cursor.toISOString().slice(0, 10))) streak++;
        else break;
      }
    }
  }

  const lastHypeDate = (data?.[0]?.created_at as string | undefined) ?? null;

  return { streak, hasHypedToday, lastHypeDate };
}