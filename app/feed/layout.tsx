// app/feed/layout.tsx
import type { ReactNode } from "react";
import CelebrationOnParam from "@/components/CelebrationOnParam.client";
import RouteToast from "@/components/RouteToast.client";
import KeepStreakNudge from "@/components/KeepStreakNudge.client";
import MobileNewHypeFab from "@/components/MobileNewHypeFab.client";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FeedLayout({ children }: { children: ReactNode }) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Collect recent daily hype timestamps (last ~35 days is plenty for a streak UI)
  let timestamps: string[] = [];
  if (user) {
    const since = new Date();
    since.setDate(since.getDate() - 35);

    const { data } = await supabase
      .from("daily_hypes")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    timestamps = (data ?? []).map((r) => r.created_at as string);
  }

  return (
    <div className="app-container py-6 space-y-4">
      {user && <KeepStreakNudge userId={user.id} timestamps={timestamps} />}
      <CelebrationOnParam />
      <RouteToast />
      {children}
      {/* Mobile-only floating action button */}
      <MobileNewHypeFab />
    </div>
  );
}