// app/discover/page.tsx
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import FollowButton from "@/components/FollowButton";
import { toggleFollow } from "@/app/actions/follow";
import KeepStreakNudge from "@/components/KeepStreakNudge";
import PageTheme from "@/components/PageTheme";

export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------------------
   Types
---------------------------------------------------------------------------- */

type SearchParams = {
  tab?: "people" | "groups";
  q?: string;
  sort?: "trending" | "new" | "az";
  page?: string;
};

type BaseProfile = {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};
type ProfileWithCreated = BaseProfile & { created_at: string };
type TrendingProfile = BaseProfile & { hype_count_7d: number };

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at?: string;
  member_count?: number;
  city?: string | null;
  school?: string | null;
};

type ProfileLite = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  city?: string | null;
  school?: string | null;
};

type GroupPost = {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: ProfileLite | null;
  group?: Pick<GroupRow, "id" | "slug" | "name"> | null;
};

const PEOPLE_PAGE_SIZE = 20;
const GROUPS_PAGE_SIZE = 12;

/* ----------------------------------------------------------------------------
   Server actions (Groups)
---------------------------------------------------------------------------- */

async function joinGroup(formData: FormData) {
  "use server";
  const supabase = await getServerClient();
  const groupId = String(formData.get("groupId") || "");
  if (!groupId) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/discover?tab=groups")}`);
  }

  await supabase.from("group_members").upsert(
    [{ group_id: groupId, user_id: user.id, role: "member" }],
    { onConflict: "group_id,user_id", ignoreDuplicates: true }
  );
}

async function leaveGroup(formData: FormData) {
  "use server";
  const supabase = await getServerClient();
  const groupId = String(formData.get("groupId") || "");
  if (!groupId) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/discover?tab=groups")}`);
  }

  await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
}

/* ----------------------------------------------------------------------------
   Page (Next 15: searchParams is a Promise)
---------------------------------------------------------------------------- */

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tab = (params.tab as SearchParams["tab"]) || "people";

  return (
    <>
      <PageTheme name="teal" />
      {tab === "groups" ? await renderGroupsTab() : await renderPeopleTab(params)}
    </>
  );
}

/* ----------------------------------------------------------------------------
   GROUPS TAB (multi-signal suggestions with keyword/tag-only fallback)
---------------------------------------------------------------------------- */

async function renderGroupsTab() {
  const supabase = await getServerClient();

  // Viewer (for join state + suggestions)
  const {
    data: { user: me },
  } = await supabase.auth.getUser();
  const viewerId = me?.id ?? null;

  /* -------- Trending groups (fallback to newest) -------- */
  let groups: GroupRow[] = [];
  {
    const { data } = await supabase
      .from("trending_groups")
      .select("id, slug, name, description, avatar_url, banner_url, member_count")
      .order("member_count", { ascending: false })
      .limit(GROUPS_PAGE_SIZE);

    if (data) {
      groups = data as GroupRow[];
    } else {
      const { data: g2 } = await supabase
        .from("hype_groups")
        .select("id, slug, name, description, avatar_url, banner_url, created_at")
        .order("created_at", { ascending: false })
        .limit(GROUPS_PAGE_SIZE);
      groups = (g2 ?? []) as GroupRow[];

      // attach member counts (best-effort)
      if (groups.length) {
        const ids = groups.map((g) => g.id);
        const { data: rows } = await supabase.from("group_members").select("group_id").in("group_id", ids);
        const map = new Map<string, number>();
        for (const r of rows ?? []) {
          map.set(r.group_id, (map.get(r.group_id) ?? 0) + 1);
        }
        groups = groups.map((g) => ({ ...g, member_count: map.get(g.id) ?? 0 }));
      }
    }
  }

  /* -------- Join state for viewer -------- */
  let joinedSet = new Set<string>();
  if (viewerId && groups.length) {
    const ids = groups.map((g) => g.id);
    const { data: mine } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", viewerId)
      .in("group_id", ids);
    joinedSet = new Set((mine ?? []).map((r) => r.group_id));
  }

  /* -------- Suggested for you (multi-signal) -------- */
  let suggested: (GroupRow & {
    overlap_count: number;
    dm_overlap: number;
    keyword_hits: number;
    tag_hits: number;
    blended_score: number;
  })[] = [];

  // We'll remember viewer tags for reason labels
  let viewerCity: string | null = null;
  let viewerSchool: string | null = null;

  if (viewerId) {
    // === 1) Followee overlap
    const { data: followees } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", viewerId);
    const followeeIds = Array.from(new Set((followees ?? []).map((f) => f.followee_id)));

    const overlapMap = new Map<string, number>();
    if (followeeIds.length) {
      const { data: gm } = await supabase
        .from("group_members")
        .select("group_id, user_id")
        .in("user_id", followeeIds);
      for (const m of gm ?? []) {
        overlapMap.set(m.group_id, (overlapMap.get(m.group_id) ?? 0) + 1);
      }
    }

    // === 2) Heavy-DM contacts (optional, with fallback)
    const dmContactIds = new Set<string>();
    {
      const { data: topDMs, error } = await supabase
        .from("top_dm_contacts" as any)
        .select("contact_id, msg_count_30d")
        .eq("user_id", viewerId)
        .order("msg_count_30d", { ascending: false })
        .limit(50);

      if (!error && topDMs?.length) {
        for (const row of topDMs) dmContactIds.add(row.contact_id);
      } else {
        const sinceISO = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const { data: dms } = await supabase
          .from("dm_messages" as any)
          .select("sender_id, recipient_id, created_at")
          .gte("created_at", sinceISO)
          .or(`sender_id.eq.${viewerId},recipient_id.eq.${viewerId}`)
          .limit(5000);
        const count = new Map<string, number>();
        for (const m of dms ?? []) {
          const other = m.sender_id === viewerId ? m.recipient_id : m.recipient_id === viewerId ? m.sender_id : null;
          if (!other) continue;
          count.set(other, (count.get(other) ?? 0) + 1);
        }
        const top = Array.from(count.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 50)
          .map(([id]) => id);
        for (const id of top) dmContactIds.add(id);
      }
    }

    const dmOverlap = new Map<string, number>();
    if (dmContactIds.size) {
      const { data: gm2 } = await supabase
        .from("group_members")
        .select("group_id, user_id")
        .in("user_id", Array.from(dmContactIds));
      for (const m of gm2 ?? []) {
        dmOverlap.set(m.group_id, (dmOverlap.get(m.group_id) ?? 0) + 1);
      }
    }

    // === 3) Keywords from recent Daily Hype
    const keywords = new Set<string>();
    {
      const sinceISO = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
      const harvest = (text: string | null | undefined) => {
        if (!text) return;
        for (const raw of text.toLowerCase().split(/[^a-z0-9]+/g)) {
          const w = raw.trim();
          if (!w || w.length < 3) continue;
          keywords.add(w);
        }
      };
      const { data: dh, error: e1 } = await supabase
        .from("daily_hype" as any)
        .select("content, created_at")
        .eq("user_id", viewerId)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!e1 && dh?.length) {
        for (const r of dh) harvest(r.content);
      } else {
        const { data: he } = await supabase
          .from("hype_entries" as any)
          .select("content, created_at")
          .eq("user_id", viewerId)
          .gte("created_at", sinceISO)
          .order("created_at", { ascending: false })
          .limit(20);
        for (const r of he ?? []) harvest(r.content);
      }
    }

    // === 4) Location / School tags
    {
      const { data: pLite } = await supabase
        .from("profiles" as any)
        .select("user_id, username, display_name, avatar_url, city, school")
        .eq("user_id", viewerId)
        .maybeSingle();
      viewerCity = (pLite as any)?.city ?? null;
      viewerSchool = (pLite as any)?.school ?? null;
    }

    // === 5) Candidate groups (exclude joined) with keyword/tag-only fallback
    const candidateIdsFromSocial = Array.from(
      new Set([...overlapMap.keys(), ...dmOverlap.keys()])
    ).filter((id) => !joinedSet.has(id));

    let candidateIds = candidateIdsFromSocial;

    if (candidateIds.length === 0 && (keywords.size || viewerCity || viewerSchool)) {
      const poolLimit = 120;
      let pool: Pick<GroupRow, "id" | "name" | "description" | "city" | "school">[] = [];

      const { data: tgs } = await supabase
        .from("trending_groups")
        .select("id, name, description")
        .order("member_count", { ascending: false })
        .limit(poolLimit);

      if (tgs?.length) {
        const ids = tgs.map((g: any) => g.id);
        const { data: tgMeta } = await supabase
          .from("hype_groups")
          .select("id, name, description, city, school")
          .in("id", ids);
        pool = (tgMeta ?? []).filter((g) => !joinedSet.has(g.id));
      } else {
        const { data: newest } = await supabase
          .from("hype_groups")
          .select("id, name, description, city, school")
          .order("created_at", { ascending: false })
          .limit(poolLimit);
        pool = (newest ?? []).filter((g) => !joinedSet.has(g.id));
      }

      const kwHit = (g: any) => {
        if (!keywords.size) return 0;
        const blob = `${g.name} ${g.description ?? ""}`.toLowerCase();
        let c = 0;
        for (const w of keywords) {
          if (blob.includes(w)) {
            c++;
            if (c >= 5) break;
          }
        }
        return c;
      };

      const tagHit = (g: any) => {
        let c = 0;
        if (viewerCity && g.city && eqLoose(viewerCity, g.city)) c++;
        if (viewerSchool && g.school && eqLoose(viewerSchool, g.school)) c++;
        return c;
      };

      const withHits = pool
        .map((g) => ({ g, k: kwHit(g), t: tagHit(g) }))
        .filter(({ k, t }) => k > 0 || t > 0)
        .slice(0, 60);

      candidateIds = withHits.map(({ g }) => g.id);
    }

    if (candidateIds.length) {
      const [{ data: rows }, { data: allMembers }] = await Promise.all([
        supabase
          .from("hype_groups")
          .select("id, slug, name, description, avatar_url, banner_url, city, school")
          .in("id", candidateIds)
          .limit(48),
        supabase.from("group_members").select("group_id").in("group_id", candidateIds),
      ]);

      const memberCount = new Map<string, number>();
      for (const r of allMembers ?? []) {
        memberCount.set(r.group_id, (memberCount.get(r.group_id) ?? 0) + 1);
      }

      const scoreKeywordHits = (g: { name: string; description: string | null | undefined }) => {
        if (!keywords.size) return 0;
        const blob = `${g.name} ${g.description ?? ""}`.toLowerCase();
        let c = 0;
        for (const w of keywords) {
          if (blob.includes(w)) {
            c++;
            if (c >= 5) break;
          }
        }
        return c;
      };

      const scoreTagHits = (g: GroupRow) => {
        let c = 0;
        if (viewerCity && g.city && eqLoose(viewerCity, g.city)) c++;
        if (viewerSchool && g.school && eqLoose(viewerSchool, g.school)) c++;
        return c;
      };

      const W = { followees: 1.0, dms: 1.2, keywords: 0.4, tags: 0.8 };

      const enriched = (rows ?? []).map((g) => {
        const overlap_count = overlapMap.get(g.id) ?? 0;
        const dm_overlap = dmOverlap.get(g.id) ?? 0;
        const keyword_hits = scoreKeywordHits(g as any);
        const tag_hits = scoreTagHits(g as any);
        const blended =
          overlap_count * W.followees +
          dm_overlap * W.dms +
          keyword_hits * W.keywords +
          tag_hits * W.tags;

        return {
          ...(g as GroupRow),
          member_count: memberCount.get(g.id) ?? 0,
          overlap_count,
          dm_overlap,
          keyword_hits,
          tag_hits,
          blended_score: blended,
        };
      });

      enriched.sort((a, b) => {
        if (b.blended_score !== a.blended_score) return b.blended_score - a.blended_score;
        return (b.member_count ?? 0) - (a.member_count ?? 0);
      });

      suggested = enriched.slice(0, 6);
    }
  }

  /* -------- Recent posts across groups -------- */
  let recentPosts: GroupPost[] = [];
  {
    const { data } = await supabase
      .from("group_posts")
      .select("id, group_id, user_id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data?.length) {
      const userIds = Array.from(new Set(data.map((p) => p.user_id)));
      const groupIds = Array.from(new Set(data.map((p) => p.group_id)));

      const [{ data: authors }, { data: groupsLite }] = await Promise.all([
        supabase.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", userIds),
        supabase.from("hype_groups").select("id, slug, name").in("id", groupIds),
      ]);

      const authorMap = new Map<string, ProfileLite>();
      for (const a of authors ?? []) authorMap.set(a.user_id, a as ProfileLite);

      const groupMap = new Map<string, Pick<GroupRow, "id" | "slug" | "name">>();
      for (const g of groupsLite ?? []) groupMap.set(g.id, g as any);

      recentPosts = data.map((p) => ({
        ...p,
        author: authorMap.get(p.user_id) ?? null,
        group: groupMap.get(p.group_id) ?? null,
      }));
    }
  }

  // Helper to render reason labels (chips)
  const ReasonChips = (g: {
    overlap_count: number;
    dm_overlap: number;
    keyword_hits: number;
    tag_hits: number;
    city?: string | null;
    school?: string | null;
  }) => {
    const chips: string[] = [];

    if (g.overlap_count > 0) chips.push(`${g.overlap_count} friend${g.overlap_count === 1 ? "" : "s"} here`);
    if (g.dm_overlap > 0) chips.push(`${g.dm_overlap} top DM contact${g.dm_overlap === 1 ? "" : "s"} here`);
    if (g.keyword_hits > 0) chips.push("matches your hype");

    const tagBits: string[] = [];
    if (g.city) tagBits.push(g.city);
    if (g.school) tagBits.push(g.school);
    if (g.tag_hits > 0) chips.push(tagBits.length ? `matches ${tagBits.join(" • ")}` : "matches your tags");

    if (chips.length === 0) return null;

    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {chips.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] opacity-80"
          >
            {c}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="app-container py-10 space-y-6">
      {/* Heading + tabs */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Discover</h1>
      </div>

      <KeepStreakNudge />
      <TabBar active="groups" />

      {/* Create group CTA */}
      <div className="ui-card p-4 flex items-center justify-between">
        <div className="text-sm opacity-85">Start a community for your crew — daily check-ins, shoutouts, and streaks.</div>
        <Link href="/groups/new" className="btn-cta">
          + Create group
        </Link>
      </div>

      {/* Suggested for you */}
      <section className="space-y-3">
        <h2 className="font-semibold">Suggested for you</h2>
        {!me ? (
          <div className="ui-card p-4 text-sm opacity-80">Sign in and follow a few friends to get personalized group suggestions.</div>
        ) : suggested.length === 0 ? (
          <div className="ui-card p-4 text-sm opacity-80">No suggestions yet — follow more people, add Daily Hype, or set city/school tags.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggested.map((g) => (
              <li key={g.id} className="ui-card p-4 flex gap-3">
                {g.avatar_url ? (
                  <img src={g.avatar_url} alt={g.name} className="h-12 w-12 rounded-xl object-cover bg-neutral-900" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-neutral-900 grid place-items-center text-sm opacity-80">
                    {g.name[0]?.toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/g/${g.slug}`} className="font-semibold truncate hover:underline">
                      {g.name}
                    </Link>
                    <span className="text-xs opacity-70">• {g.member_count ?? 0} members</span>
                  </div>

                  {g.description ? <div className="text-xs opacity-75 truncate">{g.description}</div> : null}

                  <ReasonChips
                    overlap_count={(g as any).overlap_count ?? 0}
                    dm_overlap={(g as any).dm_overlap ?? 0}
                    keyword_hits={(g as any).keyword_hits ?? 0}
                    tag_hits={(g as any).tag_hits ?? 0}
                    city={g.city}
                    school={g.school}
                  />

                  <div className="mt-2 flex items-center gap-2">
                    <Link href={`/g/${g.slug}`} className="btn-ghost text-sm">
                      View
                    </Link>
                    <form action={joinGroup}>
                      <input type="hidden" name="groupId" value={g.id} />
                      <button className="btn-cta text-sm">Join</button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Trending groups */}
      <section className="space-y-3">
        <h2 className="font-semibold">Trending groups</h2>
        {groups.length === 0 ? (
          <div className="ui-card p-4 text-sm opacity-80">No groups yet — be the first to create one!</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map((g) => (
              <li key={g.id} className="ui-card p-4 flex gap-3">
                {g.avatar_url ? (
                  <img src={g.avatar_url} alt={g.name} className="h-12 w-12 rounded-xl object-cover bg-neutral-900" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-neutral-900 grid place-items-center text-sm opacity-80">
                    {g.name[0]?.toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/g/${g.slug}`} className="font-semibold truncate hover:underline">
                      {g.name}
                    </Link>
                    <span className="text-xs opacity-70">• {g.member_count ?? 0} members</span>
                  </div>
                  {g.description ? <div className="text-xs opacity-75 truncate">{g.description}</div> : null}

                  <div className="mt-2 flex items-center gap-2">
                    <Link href={`/g/${g.slug}`} className="btn-ghost text-sm">
                      View
                    </Link>

                    {viewerId ? (
                      joinedSet.has(g.id) ? (
                        <form action={leaveGroup}>
                          <input type="hidden" name="groupId" value={g.id} />
                          <button className="btn-ghost text-sm">Joined</button>
                        </form>
                      ) : (
                        <form action={joinGroup}>
                          <input type="hidden" name="groupId" value={g.id} />
                          <button className="btn-cta text-sm">Join</button>
                        </form>
                      )
                    ) : (
                      <Link
                        href={`/login?next=${encodeURIComponent("/discover?tab=groups")}`}
                        className="btn-cta text-sm"
                      >
                        Join
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent posts across groups */}
      <section className="space-y-3">
        <h2 className="font-semibold">Happening in groups</h2>
        {recentPosts.length === 0 ? (
          <div className="ui-card p-4 text-sm opacity-80">No posts yet — join a group and spark the first hype!</div>
        ) : (
          <div className="ui-card p-3">
            <ul className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentPosts.map((p) => {
                const a = p.author;
                const initial = (a?.display_name?.[0] || a?.username?.[0] || "?").toUpperCase();
                return (
                  <li
                    key={p.id}
                    className="min-w-[280px] max-w-[320px] rounded-xl bg-white/5 ring-1 ring-white/10 p-3"
                  >
                    <div className="flex items-center gap-2">
                      {a?.avatar_url ? (
                        <img
                          src={a.avatar_url}
                          alt={a.display_name || a.username || "member"}
                          className="h-8 w-8 rounded-full object-cover bg-neutral-900"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-neutral-900 grid place-items-center text-xs opacity-80">
                          {initial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{a?.display_name || a?.username || "Member"}</div>
                        <div className="text-[11px] opacity-70 truncate">
                          in <Link className="underline" href={`/g/${p.group?.slug}`}>{p.group?.name}</Link> •{" "}
                          {new Date(p.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap break-words line-clamp-5 opacity-95">
                      {p.content}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   PEOPLE TAB
---------------------------------------------------------------------------- */

async function renderPeopleTab(params: SearchParams) {
  const q = (params.q ?? "").trim();
  const sort = (params.sort as SearchParams["sort"]) || "trending";
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const from = (pageNum - 1) * PEOPLE_PAGE_SIZE;
  const to = from + PEOPLE_PAGE_SIZE - 1;

  const supabase = await getServerClient();

  let errorMsg = "";
  let count = 0;
  let rows: Array<ProfileWithCreated | TrendingProfile> = [];

  if (sort === "trending") {
    let trendingFailed = false;

    {
      let query = supabase
        .from("trending_profiles")
        .select("user_id, username, display_name, avatar_url, bio, hype_count_7d", { count: "exact" })
        .order("hype_count_7d", { ascending: false, nullsFirst: false });

      if (q) query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);

      const { data, count: c, error } = await query.range(from, to);
      if (error) {
        trendingFailed = true;
      } else {
        const list = (data ?? []).filter((p): p is TrendingProfile => !!p && !!p.username);
        rows = list;
        count = c ?? list.length;
      }
    }

    if (trendingFailed) {
      let query = supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, bio, created_at", { count: "exact" })
        .not("username", "is", null)
        .neq("username", "")
        .order("created_at", { ascending: false });

      if (q) query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);

      const { data, count: c, error } = await query.range(from, to);
      if (error) errorMsg = error.message;

      const list = (data ?? []).filter((p): p is ProfileWithCreated => !!p && !!p.username && !!p.created_at);
      rows = list;
      count = c ?? list.length;
    }
  } else {
    let query = supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url, bio, created_at", { count: "exact" })
      .not("username", "is", null)
      .neq("username", "");

    if (q) query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);

    switch (sort) {
      case "new":
        query = query.order("created_at", { ascending: false });
        break;
      case "az":
        query = query.order("username", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, count: c, error } = await query.range(from, to);
    if (error) errorMsg = error.message;

    const list = (data ?? []).filter((p): p is ProfileWithCreated => !!p && !!p.username && !!p.created_at);
    rows = list;
    count = c ?? list.length;
  }

  if (errorMsg) {
    return (
      <div className="app-container py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Discover</h1>
        </div>
        <KeepStreakNudge />
        <TabBar active="people" />
        <div className="ui-card p-5 text-red-400">Failed to load profiles: {errorMsg}</div>
      </div>
    );
  }

  // Viewer + social context
  const {
    data: { user: me },
  } = await supabase.auth.getUser();
  const viewerId = me?.id ?? null;

  let followingSet = new Set<string>();
  let followsYouSet = new Set<string>();
  let followerCount = new Map<string, number>();
  let mutualsCount = new Map<string, number>();

  if (rows.length > 0) {
    const ids = rows.map((r) => r.user_id).filter(Boolean);

    {
      const { data: allEdges } = await supabase.from("follows").select("followee_id").in("followee_id", ids);
      for (const e of allEdges ?? []) {
        followerCount.set(e.followee_id, (followerCount.get(e.followee_id) ?? 0) + 1);
      }
    }

    if (me) {
      {
        const { data } = await supabase
          .from("follows")
          .select("followee_id")
          .eq("follower_id", me.id)
          .in("followee_id", ids);
        followingSet = new Set((data ?? []).map((r) => r.followee_id));
      }

      {
        const { data } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("followee_id", me.id)
          .in("follower_id", ids);
        followsYouSet = new Set((data ?? []).map((r) => r.follower_id));
      }

      const { data: viewerFollowees } = await supabase.from("follows").select("followee_id").eq("follower_id", me.id);
      const viewerFolloweesSet = new Set((viewerFollowees ?? []).map((r) => r.followee_id));

      const { data: candidateFollowees } = await supabase
        .from("follows")
        .select("follower_id, followee_id")
        .in("follower_id", ids);

      const map = new Map<string, Set<string>>();
      for (const e of candidateFollowees ?? []) {
        const set = map.get(e.follower_id) ?? new Set<string>();
        set.add(e.followee_id);
        map.set(e.follower_id, set);
      }

      for (const id of ids) {
        const theirSet = map.get(id);
        if (!theirSet) {
          mutualsCount.set(id, 0);
          continue;
        }
        let c = 0;
        for (const f of theirSet) if (viewerFolloweesSet.has(f)) c++;
        mutualsCount.set(id, c);
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / PEOPLE_PAGE_SIZE));

  return (
    <div className="app-container py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Discover</h1>
      </div>

      <KeepStreakNudge />
      <TabBar active="people" />

      {/* Search + Sort */}
      <section className="ui-card p-4">
        <form className="flex flex-col md:flex-row gap-3" action="/discover">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search people by name or @handle"
            className="flex-1 rounded-lg bg-neutral-900/60 px-3 py-2 outline-none"
            aria-label="Search people"
          />
          <input type="hidden" name="tab" value="people" />
          <input type="hidden" name="sort" value={sort} />
          <button
            type="submit"
            className="rounded-lg px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SortChip label="Trending" value="trending" active={sort === "trending"} q={q} />
          <SortChip label="New" value="new" active={sort === "new"} q={q} />
          <SortChip label="A–Z" value="az" active={sort === "az"} q={q} />
        </div>
      </section>

      {/* Results */}
      <section className="space-y-3">
        {rows.length === 0 ? (
          <EmptyStatePeople query={q} />
        ) : (
          rows.map((p) => (
            <ProfileRow
              key={p.user_id}
              userId={p.user_id}
              username={p.username}
              displayName={p.display_name}
              avatarUrl={p.avatar_url}
              bio={p.bio}
              hypeCount7d={"hype_count_7d" in p ? (p as TrendingProfile).hype_count_7d : undefined}
              createdAt={"created_at" in p ? (p as ProfileWithCreated).created_at : undefined}
              currentUserId={viewerId}
              initiallyFollowing={false}
              followsYou={followsYouSet.has(p.user_id)}
              followerCount={followerCount.get(p.user_id)}
              mutualCount={mutualsCount.get(p.user_id)}
            />
          ))
        )}
      </section>

      {/* Pagination */}
      {count > PEOPLE_PAGE_SIZE && (
        <nav className="flex items-center justify-between ui-card p-4" aria-label="Pagination">
          <div className="opacity-70 text-sm">
            Page {pageNum} of {totalPages} • {count} people
          </div>
          <div className="flex gap-2">
            <PageLink disabled={pageNum <= 1} label="← Prev" q={q} sort={sort} page={pageNum - 1} />
            <PageLink disabled={pageNum >= totalPages} label="Next →" q={q} sort={sort} page={pageNum + 1} />
          </div>
        </nav>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Shared UI Helpers
---------------------------------------------------------------------------- */

function TabBar({ active }: { active: "people" | "groups" }) {
  return (
    <div
      className="
        sticky top-14 z-20
        -mx-4 sm:mx-0 px-4
        bg-[color:var(--page-bg,rgba(18,18,18,0.85))] backdrop-blur
        supports-[backdrop-filter]:bg-[color-mix(in_oklab,black_65%,transparent)]
      "
    >
      <div className="ui-card p-2 flex gap-2 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]">
        <Link
          href="/discover?tab=people"
          className={`px-3 py-1.5 rounded-full text-sm ${
            active === "people" ? "bg-amber-500 text-black" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          People
        </Link>
        <Link
          href="/discover?tab=groups"
          className={`px-3 py-1.5 rounded-full text-sm ${
            active === "groups" ? "bg-amber-500 text-black" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          Groups
        </Link>
      </div>
    </div>
  );
}

function SortChip({
  label,
  value,
  active,
  q,
}: {
  label: string;
  value: Required<SearchParams>["sort"];
  active: boolean;
  q: string;
}) {
  const href = `/discover?tab=people&sort=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1 text-sm",
        active ? "bg-amber-500 text-black" : "bg-neutral-900/60 hover:bg-neutral-800",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function PageLink({
  disabled,
  label,
  q,
  sort,
  page,
}: {
  disabled: boolean;
  label: string;
  q: string;
  sort: string;
  page: number;
}) {
  const href = `/discover?tab=people&sort=${sort}${q ? `&q=${encodeURIComponent(q)}` : ""}&page=${page}`;
  return disabled ? (
    <span className="rounded-lg px-3 py-2 bg-neutral-900/40 text-sm opacity-60 cursor-not-allowed">{label}</span>
  ) : (
    <Link href={href} className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 transition text-sm">
      {label}
    </Link>
  );
}

function ProfileRow({
  userId,
  username,
  displayName,
  avatarUrl,
  bio,
  hypeCount7d,
  createdAt,
  currentUserId,
  initiallyFollowing,
  followsYou,
  followerCount,
  mutualCount,
}: {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  hypeCount7d?: number;
  createdAt?: string;
  currentUserId: string | null;
  initiallyFollowing?: boolean;
  followsYou?: boolean;
  followerCount?: number;
  mutualCount?: number;
}) {
  const initial = (displayName?.[0] || username?.[0] || "?").toUpperCase();
  const isSelf = currentUserId && currentUserId === userId;

  return (
    <div className="ui-card px-4 py-3 flex items-center gap-3">
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName || username} className="h-10 w-10 rounded-full object-cover bg-neutral-900" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-neutral-900 grid place-items-center text-sm opacity-80">{initial}</div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold truncate">{displayName || username}</div>
          {followsYou ? (
            <span className="inline-flex items-center rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] opacity-80">
              follows you
            </span>
          ) : null}
        </div>

        <div className="text-sm opacity-70 truncate">@{username}</div>

        {(typeof followerCount === "number" || typeof mutualCount === "number") && (
          <div className="text-xs opacity-70 flex gap-3">
            {typeof followerCount === "number" && (
              <span>
                {followerCount} follower{followerCount === 1 ? "" : "s"}
              </span>
            )}
            {typeof mutualCount === "number" && mutualCount > 0 && (
              <span>
                {mutualCount} mutual{mutualCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}

        {bio && <div className="text-xs opacity-70 truncate">{bio}</div>}
        {typeof hypeCount7d === "number" ? (
          <div className="text-xs opacity-70">🔥 {hypeCount7d} hype this week</div>
        ) : createdAt ? (
          <div className="text-xs opacity-70">Joined {new Date(createdAt).toLocaleDateString()}</div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {!isSelf ? (
          currentUserId ? (
            <FollowButton
              targetId={userId}
              initiallyFollowing={!!initiallyFollowing}
              followBack={!!followsYou}
              action={toggleFollow}
            />
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium"
            >
              Follow
            </Link>
          )
        ) : null}

        <Link href={`/u/${encodeURIComponent(username)}`} className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm">
          View
        </Link>
        <Link href={`/invite?to=${encodeURIComponent(username)}`} className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm">
          Invite to Hype
        </Link>
      </div>
    </div>
  );
}

function EmptyStatePeople({ query }: { query: string }) {
  return (
    <div className="ui-card p-6 text-center">
      <p className="mb-3">
        {query ? (
          <>
            No people found for <span className="font-semibold">“{query}”</span>.
          </>
        ) : (
          "No people to discover yet."
        )}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Link
          href="/invite"
          className="rounded-lg px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium"
        >
          Invite friends
        </Link>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Small util
---------------------------------------------------------------------------- */

function eqLoose(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}