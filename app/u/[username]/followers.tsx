// app/u/[username]/followers.tsx
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import ListUserItem from "@/components/ListUserItem";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { username: string };
  searchParams?: { page?: string };
};

type ProfileLite = {
  id: string; // maps from profiles.user_id
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

const PAGE_SIZE = 20;

export default async function FollowersPage({ params, searchParams }: PageProps) {
  const handle = params.username;
  const pageNum = Math.max(1, Number(searchParams?.page ?? 1));
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await getServerClient();

  // Who is the profile owner?
  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_url")
    .eq("username", handle)
    .maybeSingle();

  if (profErr || !prof) {
    return (
      <div className="app-container py-10">
        <h1 className="text-2xl font-bold mb-6">Followers</h1>
        <div className="ui-card p-5 text-red-400">Profile “{handle}” not found.</div>
      </div>
    );
  }

  // Edges: who follows this profile owner?
  const { data: edges, count: total, error: edgeErr } = await supabase
    .from("follows")
    .select("follower_id, created_at", { count: "exact" })
    .eq("followee_id", prof.user_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (edgeErr) {
    return (
      <div className="app-container py-10">
        <h1 className="text-2xl font-bold mb-6">Followers</h1>
        <div className="ui-card p-5 text-red-400">{edgeErr.message}</div>
      </div>
    );
  }

  const followerIds = (edges ?? []).map((e) => e.follower_id);
  let users: ProfileLite[] = [];

  if (followerIds.length > 0) {
    const { data: rows } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url, bio")
      .in("user_id", followerIds);

    users =
      (rows ?? []).map((r) => ({
        id: r.user_id,
        username: r.username,
        display_name: r.display_name,
        avatar_url: r.avatar_url,
        bio: r.bio,
      })) ?? [];
  }

  // Who is the viewer?
  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  // Sets for badges/buttons relative to the viewer
  let initiallyFollowingSet = new Set<string>();
  let followsYouSet = new Set<string>();

  if (me && users.length > 0) {
    const ids = users.map((u) => u.id);

    // Which listed users does the viewer already follow?
    const { data: myFollows } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", me.id)
      .in("followee_id", ids);
    initiallyFollowingSet = new Set((myFollows ?? []).map((r) => r.followee_id));

    // Which listed users follow the viewer?
    const { data: theyFollowMe } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("followee_id", me.id)
      .in("follower_id", ids);
    followsYouSet = new Set((theyFollowMe ?? []).map((r) => r.follower_id));
  }

  const totalCount = total ?? followerIds.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="app-container py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Followers <span className="opacity-60">@{prof.username}</span>
        </h1>
        <Link
          href={`/u/${encodeURIComponent(prof.username)}`}
          className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          Back to Profile
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="ui-card p-5 opacity-70">No followers yet.</div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <ListUserItem
              key={u.id}
              profile={u}
              viewerId={me?.id ?? null}
              initiallyFollowing={initiallyFollowingSet.has(u.id)}
              followsYou={followsYouSet.has(u.id)}
            />
          ))}
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <nav className="flex items-center justify-between ui-card p-4">
          <div className="opacity-70 text-sm">
            Page {pageNum} of {totalPages} • {totalCount} followers
          </div>
          <div className="flex gap-2">
            <PageLink
              hrefBase={`/u/${encodeURIComponent(prof.username)}/followers`}
              page={pageNum - 1}
              disabled={pageNum <= 1}
            >
              ← Prev
            </PageLink>
            <PageLink
              hrefBase={`/u/${encodeURIComponent(prof.username)}/followers`}
              page={pageNum + 1}
              disabled={pageNum >= totalPages}
            >
              Next →
            </PageLink>
          </div>
        </nav>
      )}
    </div>
  );
}

function PageLink({
  hrefBase,
  page,
  disabled,
  children,
}: {
  hrefBase: string;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const href = `${hrefBase}?page=${page}`;
  return disabled ? (
    <span className="rounded-lg px-3 py-2 bg-neutral-900/40 text-sm opacity-60 cursor-not-allowed">
      {children}
    </span>
  ) : (
    <Link href={href} className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm">
      {children}
    </Link>
  );
}