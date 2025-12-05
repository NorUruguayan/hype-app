// components/KeepStreakNudge.tsx
import { getServerClient } from "@/lib/supabase/server";
import KeepStreakNudgeNoSSR from "@/components/KeepStreakNudge.no-ssr.client";

/**
 * Server wrapper: fetch recent daily hype timestamps for the signed-in user.
 * The actual UI is rendered by a client-only wrapper to avoid hydration drift.
 */
export default async function KeepStreakNudge() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("daily_hypes") // change to your exact table name if different
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(120);

  const timestamps = (data ?? []).map((r) => r.created_at as string);

  return <KeepStreakNudgeNoSSR userId={user.id} timestamps={timestamps} />;
}