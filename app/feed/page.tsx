// app/feed/page.tsx
/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import FeedTabs from "@/components/FeedTabs";
import FeedFilters from "@/components/FeedFilters.client";
import FeedCard from "@/components/FeedCard";
import MobileNewHypeFab from "@/components/MobileNewHypeFab.client";

export const dynamic = "force-dynamic";

type SearchParams = {
  tab?: "following" | "public" | "all";
  cat?: "all" | "personal" | "sports" | "school" | "career";
  tf?: "today" | "week" | "upcoming";
  vis?: "all" | "public" | "followers" | "mine";
  sort?: "new" | "ending";
};

type RawGroupPost = {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type RawDailyHype = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type ProfileLite = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type GroupLite = {
  id: string;
  slug: string;
  name: string;
};

type FeedItem = {
  id: string;
  kind: "group_post" | "daily_hype";
  author_id: string;
  group_id?: string | null;
  content: string;
  created_at: string;
};

function sinceFromTimeframe(tf?: SearchParams["tf"]): Date {
  const now = new Date();
  switch (tf) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "upcoming":
    default: {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
  }
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // --- Next.js 15: searchParams is a Promise
  const params = await searchParams;

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tab = (params.tab as SearchParams["tab"]) ?? "public";
  const tf = (params.tf as SearchParams["tf"]) ?? "today";
  const vis = (params.vis as SearchParams["vis"]) ?? "all";
  const sort = (params.sort as SearchParams["sort"]) ?? "new";

  const since = sinceFromTimeframe(tf).toISOString();

  // ------------ Social scope (for "Following" and "Mine") ------------
  let scopedAuthorIds: string[] | null = null;
  if (tab === "following" || vis === "mine") {
    if (vis === "mine") {
      scopedAuthorIds = [user.id];
    } else {
      const { data: edges } = await supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", user.id);
      const ids = Array.from(new Set((edges ?? []).map((e) => e.followee_id)));
      ids.unshift(user.id);
      scopedAuthorIds = ids;
    }
  }

  // ------------ Fetch group posts ------------
  let gpQuery = supabase
    .from("group_posts")
    .select("id, group_id, user_id, content, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(80);

  if (scopedAuthorIds) gpQuery = gpQuery.in("user_id", scopedAuthorIds);
  if (vis === "mine") gpQuery = gpQuery.eq("user_id", user.id);

  const { data: gpRows } = await gpQuery;

  // ------------ Fetch daily hype posts ------------
  let dhQuery = supabase
    .from("daily_hypes")
    .select("id, user_id, content, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(80);

  if (scopedAuthorIds) dhQuery = dhQuery.in("user_id", scopedAuthorIds);
  if (vis === "mine") dhQuery = dhQuery.eq("user_id", user.id);

  const { data: dhRows } = await dhQuery;

  // ------------ Combine + hydrate authors & groups ------------
  const items: FeedItem[] = [
    ...((gpRows ?? []) as RawGroupPost[]).map((r) => ({
      id: `gp_${r.id}`,
      kind: "group_post" as const,
      author_id: r.user_id,
      group_id: r.group_id,
      content: r.content,
      created_at: r.created_at,
    })),
    ...((dhRows ?? []) as RawDailyHype[]).map((r) => ({
      id: `dh_${r.id}`,
      kind: "daily_hype" as const,
      author_id: r.user_id,
      group_id: null,
      content: r.content,
      created_at: r.created_at,
    })),
  ];

  // Sort newest first (server queries already do this; this protects the merge)
  items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  // Limit for first render
  const limited = items.slice(0, 40);

  // Fetch authors
  const authorIds = Array.from(new Set(limited.map((i) => i.author_id)));
  const { data: authors } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_url")
    .in("user_id", authorIds);
  const authorMap = new Map<string, ProfileLite>();
  for (const a of authors ?? []) authorMap.set(a.user_id, a as ProfileLite);

  // Fetch groups for the group posts
  const groupIds = Array.from(
    new Set(limited.filter((i) => i.group_id).map((i) => i.group_id as string))
  );
  let groupMap = new Map<string, GroupLite>();
  if (groupIds.length) {
    const { data: groups } = await supabase
      .from("hype_groups")
      .select("id, slug, name")
      .in("id", groupIds);
    groupMap = new Map<string, GroupLite>();
    for (const g of groups ?? []) groupMap.set(g.id, g as GroupLite);
  }

  // Build view models for cards
  const cards = limited.map((i) => {
    const a = authorMap.get(i.author_id);
    const g = i.group_id ? groupMap.get(i.group_id) : undefined;

    const author = {
      name: a?.display_name || a?.username || "Member",
      handle: a?.username ? `@${a.username}` : "@member",
      avatar: a?.avatar_url || undefined,
    };

    const when = new Date(i.created_at).toLocaleString();

    return {
      id: i.id,
      text: i.content,
      time: when,
      author,
      group: g ? { name: g.name, slug: g.slug } : undefined,
      kind: i.kind,
    };
  });

  const hasItems = cards.length > 0;

  return (
    <div className="space-y-6">
      {/* Header (global header has the main CTA) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Your feed</h1>
          <FeedTabs />
        </div>
      </div>

      {/* Filters */}
      <div className="ui-card p-4">
        <FeedFilters />
      </div>

      {/* Content */}
      {hasItems ? (
        <div className="grid gap-3">
          {cards.map((c, i) => (
            <FeedCard
              key={c.id}
              author={c.author}
              time={c.time}
              text={c.text}
              group={c.group}
              kind={c.kind}
              withDivider={i > 0}
            />
          ))}
        </div>
      ) : (
        <EmptyFeed />
      )}

      {/* Mobile-only floating action button */}
      <MobileNewHypeFab />
    </div>
  );
}

/* ---------------------------------------- */
/* Empty state                              */
/* ---------------------------------------- */
function EmptyFeed() {
  return (
    <div className="ui-card p-6">
      <div className="mb-3 text-lg font-semibold">No posts yet</div>
      <p className="text-sm opacity-80">
        Your feed will fill up as you post and connect with people. Try one of
        these to get rolling:
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href="/daily" className="btn-cta">Post today’s hype</a>
        <a href="/discover?tab=people" className="btn-ghost">Find people</a>
        <a href="/discover?tab=groups" className="btn-ghost">Join groups</a>
        <a href="/invite" className="btn-ghost">Invite friends</a>
      </div>
    </div>
  );
}