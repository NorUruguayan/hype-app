// app/u/[username]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import ProfileHeaderGlobal from "@/components/ProfileHeaderGlobal";

type PageProps = {
  params: Promise<{ username: string }>; // Next 15 dynamic params are async
};

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: PageProps) {
  // 0) username
  const { username } = await params;
  const handle = (username || "").toLowerCase();

  const supabase = await getServerClient();

  // 1) profile by username
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", handle)
    .maybeSingle();

  if (pErr || !profile) notFound();

  // 2) recent hypes *for this profile* (received)
  // Adjust the column name if yours differs; many schemas use profile_user_id or user_id
  const { data: itemsData = [] } = await supabase
    .from("hypes")
    .select("id, content, created_at")
    .eq("profile_user_id", profile.user_id) // <-- change to .eq("user_id", profile.user_id) if that's your column
    .order("created_at", { ascending: false })
    .limit(20);

  const items = itemsData ?? [];

  return (
    <div className="app-container py-10 space-y-8">
      {/* Global header with avatar/banner/username */}
      <ProfileHeaderGlobal username={handle} />

      {/* Action row */}
      <section className="ui-card p-4 flex items-center justify-between gap-3">
        <div className="text-sm opacity-80">
          <span className="font-semibold">@{handle}</span> •{" "}
          <span>
            {items.length === 0
              ? "No hype yet — be the first!"
              : `${items.length} recent ${items.length === 1 ? "hype" : "hypes"}`}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href="/settings"
            className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 transition text-sm"
          >
            Edit Profile
          </Link>
          <Link
            href="/invite"
            className="rounded-lg px-3 py-2 bg-amber-500 hover:bg-amber-400 transition text-sm font-medium text-black"
          >
            Invite Friends
          </Link>
        </div>
      </section>

      {/* Personal feed */}
      <section className="ui-card p-5">
        <h2 className="font-semibold mb-4 text-lg">Recent Hype</h2>

        {items.length === 0 ? (
          <EmptyState handle={handle} />
        ) : (
          <ul className="space-y-3">
            {items.map((item: any) => (
              <li key={item.id} className="rounded-lg bg-neutral-900/40 p-4">
                <div className="text-xs opacity-70 mb-1">
                  {new Date(item.created_at).toLocaleString()}
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{item.content}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState({ handle }: { handle: string }) {
  return (
    <div className="rounded-lg bg-neutral-900/40 p-6 text-center">
      <p className="mb-3">No hype has been posted for @{handle} yet.</p>
      <div className="flex items-center justify-center gap-2">
        <Link
          href="/invite"
          className="rounded-lg px-3 py-2 bg-amber-500 hover:bg-amber-400 transition text-sm font-medium text-black"
        >
          Invite friends to hype you
        </Link>
        <Link
          href="/share"
          className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 transition text-sm"
        >
          Share your page
        </Link>
      </div>
    </div>
  );
}