// app/notifications/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PageTheme from "@/components/PageTheme";
import { getServerClient } from "@/lib/supabase/server";
import { IconAt, IconInbox, IconSparkles, IconUserPlus } from "@/components/icons";

export const dynamic = "force-dynamic";

type Notif = {
  id: string;
  type: string | null;
  data: any | null;
  is_read: boolean | null;
  created_at: string;
};

export default async function NotificationsPage() {
  const supabase = await getServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data, error: qErr } = await supabase
    .from("notifications")
    .select("id, type, data, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (qErr) {
    return (
      <>
        <PageTheme name="coral" />
        <main className="app-container py-10">
          <div className="ui-card p-5">Couldn’t load notifications: {qErr.message}</div>
        </main>
      </>
    );
  }

  const list = (data ?? []) as Notif[];
  const unread = list.filter((n) => !n.is_read);

  return (
    <>
      <PageTheme name="coral" />
      <main className="app-container py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Notifications</h1>

          {unread.length > 0 && (
            <form action={markAllRead}>
              <input type="hidden" name="intent" value="mark-all" />
              <button className="btn-ghost text-sm">Mark all read ({unread.length})</button>
            </form>
          )}
        </div>

        {list.length === 0 ? (
          <div className="ui-card p-6 flex items-center gap-4">
            <div
              className="shrink-0 grid place-items-center w-14 h-14 rounded-xl text-black"
              style={{ background: "linear-gradient(135deg,var(--brand-1),var(--brand-2))" }}
            >
              <IconInbox width={26} height={26} />
            </div>
            <div>
              <div className="mb-1 text-lg font-semibold">You’re all caught up!</div>
              <div className="text-sm opacity-80">
                Head to <Link href="/discover" className="underline">Discover</Link> to find people to follow.
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => {
              const { icon, title } = getNotifIconAndTitle(n);
              return (
                <li key={n.id} className="ui-card px-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex items-start gap-3">
                    <div
                      aria-hidden
                      className="mt-0.5 grid place-items-center h-7 w-7 rounded-lg text-black shrink-0"
                      style={{ background: "linear-gradient(135deg,var(--brand-1),var(--brand-2))" }}
                      title={n.type ?? "notification"}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium truncate">{title}</div>
                      <div className="text-xs opacity-70 mt-0.5">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!n.is_read ? (
                    <form action={markRead}>
                      <input type="hidden" name="id" value={n.id} />
                      <button className="chip text-xs">Mark read</button>
                    </form>
                  ) : (
                    <span className="text-xs opacity-50">Read</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function getNotifIconAndTitle(n: Notif) {
  const from = n.data?.from_username || "Someone";
  switch (n.type) {
    case "new_hype":
      return {
        icon: <IconSparkles width={16} height={16} />,
        title: `${from} hyped you`,
      };
    case "new_follower":
      return {
        icon: <IconUserPlus width={16} height={16} />,
        title: `${from} followed you`,
      };
    case "mention":
      return {
        icon: <IconAt width={16} height={16} />,
        title: `${from} mentioned you`,
      };
    default:
      return {
        icon: <IconInbox width={16} height={16} />,
        title: n.data?.title || "Notification",
      };
  }
}

// ----- Server actions -----

async function markRead(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await getServerClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/notifications");
}

async function markAllRead() {
  "use server";
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  revalidatePath("/notifications");
}