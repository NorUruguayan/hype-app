"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Bell with unread count. Polls periodically and bumps the badge
 * (uses .notif-badge-bump in your globals.css) when the count changes.
 */
export default function TopBarNotifications() {
  const supabase = createClient();

  const [count, setCount] = useState<number>(0);
  const prev = useRef<number>(0);
  const [bump, setBump] = useState(false);

  // bump on change
  useEffect(() => {
    if (prev.current !== count) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 260);
      prev.current = count;
      return () => clearTimeout(t);
    }
  }, [count]);

  // fetch unread count
  async function fetchCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCount(0);
      return;
    }
    const { count: c } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setCount(c ?? 0);
  }

  useEffect(() => {
    let timer: any;

    const start = () => {
      fetchCount();
      timer = setInterval(fetchCount, 20000); // 20s poll
    };
    const stop = () => timer && clearInterval(timer);

    start();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${count ? `: ${count} unread` : ""}`}
      className="btn-ghost relative"
      title="Notifications"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" className="opacity-90" aria-hidden>
        <path
          fill="currentColor"
          d="M12 22a2.5 2.5 0 0 1-2.45-2h4.9A2.5 2.5 0 0 1 12 22Zm8-6v-4a8 8 0 1 0-16 0v4l-2 2v1h20v-1l-2-2Z"
        />
      </svg>

      {count > 0 && (
        <span
          className={`absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full
                      px-1.5 py-[2px] text-[10px] font-bold text-black
                      ${bump ? "notif-badge-bump" : ""}`}
          style={{
            background: "linear-gradient(135deg,var(--brand-1),var(--brand-2))",
            boxShadow: "0 4px 12px rgba(0,0,0,.35)",
          }}
          aria-hidden
        >
          {count}
        </span>
      )}
    </Link>
  );
}