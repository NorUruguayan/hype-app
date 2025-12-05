// components/TopBarNotifications.tsx
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";

export default async function TopBarNotifications() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const unread = count ?? 0;

  return (
    <Link href="/notifications" className="relative rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm">
      Notifications
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-black" />
      )}
    </Link>
  );
}