"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NotifBell() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const supa = createClient();
    let mounted = true;

    (async () => {
      const { data: { user } } = await supa.auth.getUser();
      if (!mounted || !user) return;

      // initial unread count
      const { count } = await supa
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setCount(count ?? 0);

      // realtime updates
      const channel = supa
        .channel(`notif-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => setCount((c) => c + 1)
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const was = (payload.old as any)?.is_read;
            const now = (payload.new as any)?.is_read;
            if (was === false && now === true) setCount((c) => Math.max(0, c - 1));
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        supa.removeChannel(channel);
      };
    })();
  }, []);

  return (
    <Link href="/notifications" className="btn-ghost relative h-8 px-3 text-[13px] rounded-xl">
      Notifications
      {count > 0 && (
        <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 text-black text-[11px] px-1.5 py-0.5">
          {count}
        </span>
      )}
    </Link>
  );
}