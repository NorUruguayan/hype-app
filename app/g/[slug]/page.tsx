// app/g/[slug]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import PageTheme from "@/components/PageTheme";

export const dynamic = "force-dynamic";

/* ---------------------------------- Actions ---------------------------------- */

async function joinGroup(formData: FormData) {
  "use server";
  const supabase = await getServerClient();
  const groupId = String(formData.get("groupId") || "");
  const slug = String(formData.get("slug") || "");
  if (!groupId || !slug) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/g/${slug}`)}`);

  await supabase
    .from("group_members")
    .upsert([{ group_id: groupId, user_id: user.id, role: "member" }], {
      onConflict: "group_id,user_id",
      ignoreDuplicates: true,
    });

  redirect(`/g/${slug}`);
}

async function leaveGroup(formData: FormData) {
  "use server";
  const supabase = await getServerClient();
  const groupId = String(formData.get("groupId") || "");
  const slug = String(formData.get("slug") || "");
  if (!groupId || !slug) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/g/${slug}`)}`);

  await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
  redirect(`/g/${slug}`);
}

async function createPost(formData: FormData) {
  "use server";
  const supabase = await getServerClient();

  const slug = String(formData.get("slug") || "");
  const groupId = String(formData.get("groupId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!slug || !groupId) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/g/${slug}`)}`);

  if (content.length < 1) {
    redirect(`/g/${encodeURIComponent(slug)}?err=${encodeURIComponent("Say something first!")}`);
  }

  // RLS will enforce membership. If they’re not a member, this insert will fail.
  const { error } = await supabase
    .from("group_posts")
    .insert([{ group_id: groupId, user_id: user.id, content }]);

  if (error) {
    redirect(`/g/${encodeURIComponent(slug)}?err=${encodeURIComponent(error.message)}`);
  }

  redirect(`/g/${encodeURIComponent(slug)}`);
}

/* ----------------------------------- Page ----------------------------------- */

type Group = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_by: string;
  created_at: string;
  member_count: number;
};

type ProfileLite = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type PostRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author?: ProfileLite | null;
};

const PAGE_SIZE = 20;

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string; err?: string };
}) {
  const supabase = await getServerClient();
  const pageNum = Math.max(1, Number(searchParams?.page ?? 1));
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const err = searchParams?.err;

  // Try trending_groups first (has member_count); fallback to hype_groups
  let group: Group | null = null;

  {
    const { data, error } = await supabase
      .from("trending_groups")
      .select("id, slug, name, description, avatar_url, banner_url, created_by, created_at, member_count")
      .eq("slug", params.slug)
      .maybeSingle();

    if (data) group = (data as unknown) as Group;
    else {
      // fallback
      const { data: g2 } = await supabase
        .from("hype_groups")
        .select("id, slug, name, description, avatar_url, banner_url, created_by, created_at")
        .eq("slug", params.slug)
        .maybeSingle();

      if (!g2) notFound();
      const { data: c } = await supabase.from("group_members").select("group_id").eq("group_id", g2.id);
      group = { ...(g2 as any), member_count: (c ?? []).length } as Group;
    }
  }

  // Viewer
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;

  // Is viewer a member?
  let joined = false;
  if (viewerId) {
    const { data: m } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("group_id", group!.id)
      .eq("user_id", viewerId)
      .maybeSingle();
    joined = !!m;
  }

  // Members (for the header section)
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", group!.id)
    .limit(24);

  let memberProfiles: ProfileLite[] = [];
  if (members?.length) {
    const ids = members.map((m) => m.user_id);
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", ids);
    memberProfiles = (profs ?? []) as any;
  }

  // Posts (author attached)
  let posts: PostRow[] = [];
  let totalPosts = 0;

  {
    const { data, error, count } = await supabase
      .from("group_posts")
      .select("id, content, created_at, user_id", { count: "exact" })
      .eq("group_id", group!.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      // join authors
      const authorIds = Array.from(new Set(data.map((p) => p.user_id)));
      let authorMap = new Map<string, ProfileLite>();

      if (authorIds.length) {
        const { data: auths } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", authorIds);

        for (const a of auths ?? []) {
          authorMap.set(a.user_id, a as ProfileLite);
        }
      }

      posts = data.map((p) => ({ ...p, author: authorMap.get(p.user_id) ?? null }));
      totalPosts = count ?? posts.length;
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));

  return (
    <>
      <PageTheme name="teal" />

      <div className="app-container py-8 space-y-6">
        {/* Group header */}
        <div className="overflow-hidden rounded-3xl ring-1 ring-white/10">
          <div
            className="h-32 md:h-40 brand-gradient"
            style={
              group!.banner_url
                ? { backgroundImage: `url(${group!.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />
          <div className="bg-black/40 px-5 pb-5 pt-3 md:px-6">
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-end gap-3">
                {group!.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group!.avatar_url}
                    alt={group!.name}
                    className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover bg-neutral-900 -mt-10 ring-2 ring-black/50"
                  />
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-neutral-900 grid place-items-center -mt-10 ring-2 ring-black/50">
                    <span className="text-xl font-bold">{group!.name[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="pb-1">
                  <div className="text-2xl font-semibold leading-tight">{group!.name}</div>
                  <div className="opacity-80 text-sm">
                    @{group!.slug} • {group!.member_count} member{group!.member_count === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-1">
                {viewerId ? (
                  joined ? (
                    <form action={leaveGroup}>
                      <input type="hidden" name="groupId" value={group!.id} />
                      <input type="hidden" name="slug" value={group!.slug} />
                      <button className="btn-ghost">Joined</button>
                    </form>
                  ) : (
                    <form action={joinGroup}>
                      <input type="hidden" name="groupId" value={group!.id} />
                      <input type="hidden" name="slug" value={group!.slug} />
                      <button className="btn-cta">Join group</button>
                    </form>
                  )
                ) : (
                  <Link href={`/login?next=${encodeURIComponent(`/g/${group!.slug}`)}`} className="btn-cta">
                    Join group
                  </Link>
                )}
              </div>
            </div>

            {group!.description ? <p className="mt-3 max-w-3xl text-sm opacity-90">{group!.description}</p> : null}
          </div>
        </div>

        {/* Error toast */}
        {err ? <div className="ui-card p-4 text-red-300">{err}</div> : null}

        {/* Members (unchanged) */}
        <section className="ui-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Members</h2>
            <div className="opacity-70 text-sm">{group!.member_count} total</div>
          </div>

          {memberProfiles.length === 0 ? (
            <div className="mt-4 text-sm opacity-75">No members yet. Be the first to join!</div>
          ) : (
            <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {memberProfiles.map((m) => (
                <li key={m.user_id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                  <div className="flex items-center gap-2">
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.avatar_url}
                        alt={m.display_name || m.username || "member"}
                        className="h-8 w-8 rounded-full object-cover bg-neutral-900"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-neutral-900 grid place-items-center text-xs opacity-80">
                        {(m.display_name?.[0] || m.username?.[0] || "?").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m.display_name || m.username || "Member"}</div>
                      {m.username ? <div className="text-xs opacity-70 truncate">@{m.username}</div> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ------------------------------ Group feed ------------------------------ */}
        <section className="space-y-3">
          {/* Composer visible only to joined members */}
          {viewerId && joined ? (
            <div className="ui-card p-4 md:p-5">
              <form action={createPost} className="space-y-3">
                <input type="hidden" name="groupId" value={group!.id} />
                <input type="hidden" name="slug" value={group!.slug} />
                <label className="block text-sm opacity-80 mb-1">Post to {group!.name}</label>
                <textarea
                  name="content"
                  maxLength={1000}
                  rows={3}
                  placeholder="Share your hype, shoutouts, or progress…"
                  className="w-full rounded-xl bg-neutral-950/60 p-3 text-[15px] leading-6 outline-none ring-1 ring-white/10 focus:ring-white/20"
                />
                <div className="flex items-center justify-end">
                  <button className="btn-cta" type="submit">
                    Post
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="ui-card p-4 text-sm opacity-80">
              Join this group to post and see member-only hype.
            </div>
          )}

          {/* Posts list (show even if not joined: you can switch this to joined-only if you prefer) */}
          {posts.length === 0 ? (
            <div className="ui-card p-5 text-sm opacity-80">No posts yet. Be the first to post!</div>
          ) : (
            <ul className="space-y-2">
              {posts.map((p) => {
                const a = p.author;
                const initial = (a?.display_name?.[0] || a?.username?.[0] || "?").toUpperCase();
                return (
                  <li key={p.id} className="ui-card p-4 flex gap-3">
                    {a?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.avatar_url}
                        alt={a.display_name || a.username || "member"}
                        className="h-10 w-10 rounded-full object-cover bg-neutral-900"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-neutral-900 grid place-items-center text-sm opacity-80">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">
                          {a?.display_name || a?.username || "Member"}
                        </span>
                        {a?.username ? (
                          <span className="text-xs opacity-70 truncate">@{a.username}</span>
                        ) : null}
                        <span className="ml-auto text-xs opacity-60">
                          {new Date(p.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 whitespace-pre-wrap break-words text-[15px] opacity-95">
                        {p.content}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Pagination */}
          {totalPosts > PAGE_SIZE && (
            <nav className="flex items-center justify-between ui-card p-4">
              <div className="opacity-70 text-sm">
                Page {pageNum} of {totalPages} • {totalPosts} posts
              </div>
              <div className="flex gap-2">
                {pageNum > 1 ? (
                  <Link href={`/g/${group!.slug}?page=${pageNum - 1}`} className="btn-ghost">
                    ← Newer
                  </Link>
                ) : (
                  <span className="btn-ghost opacity-50 cursor-not-allowed">← Newer</span>
                )}
                {pageNum < totalPages ? (
                  <Link href={`/g/${group!.slug}?page=${pageNum + 1}`} className="btn-ghost">
                    Older →
                  </Link>
                ) : (
                  <span className="btn-ghost opacity-50 cursor-not-allowed">Older →</span>
                )}
              </div>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}