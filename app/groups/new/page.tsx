// app/groups/new/page.tsx
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import PageTheme from "@/components/PageTheme"; // expects prop: name

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function createGroup(formData: FormData) {
  "use server";
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const avatar_url = String(formData.get("avatar_url") || "").trim() || null;
  const banner_url = String(formData.get("banner_url") || "").trim() || null;

  if (name.length < 3) {
    redirect(`/groups/new?err=${encodeURIComponent("Name must be at least 3 characters.")}`);
  }

  let slug = slugify(slugRaw || name);
  if (!slug) slug = slugify(`${name}-${Date.now()}`);

  // unique slug check
  {
    const { data: exists } = await supabase
      .from("hype_groups")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (exists) {
      redirect(`/groups/new?err=${encodeURIComponent("That URL is taken. Try another slug.")}`);
    }
  }

  const { data: group, error } = await supabase
    .from("hype_groups")
    .insert([
      {
        slug,
        name,
        description,
        avatar_url,
        banner_url,
        created_by: user.id,
      },
    ])
    .select("id, slug")
    .single();

  if (error || !group) {
    redirect(`/groups/new?err=${encodeURIComponent(error?.message || "Could not create group")}`);
  }

  await supabase
    .from("group_members")
    .upsert([{ group_id: group.id, user_id: user.id, role: "owner" }], {
      onConflict: "group_id,user_id",
      ignoreDuplicates: true,
    });

  redirect(`/g/${encodeURIComponent(group.slug)}`);
}

export default async function NewGroupPage({
  searchParams,
}: {
  searchParams?: { err?: string };
}) {
  const err = searchParams?.err;

  return (
    <>
      {/* Use the warm settings/form theme */}
      <PageTheme name="sand" />
      <div className="app-container py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Create a group</h1>
        </div>

        {err ? <div className="ui-card p-4 text-red-300">{err}</div> : null}

        <div className="overflow-hidden rounded-3xl ring-1 ring-white/10">
          <div className="brand-gradient h-10 w-full opacity-90" />
          <div className="bg-black/40 p-5 md:p-6">
            <form action={createGroup} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm opacity-80 mb-1">Name</label>
                <input
                  name="name"
                  required
                  minLength={3}
                  maxLength={60}
                  placeholder="Gym Buddies, Interview Grind, Crypto Labs…"
                  className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-sm opacity-80 mb-1">Custom URL (slug)</label>
                <input
                  name="slug"
                  placeholder="interview-grind"
                  className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20"
                />
                <p className="text-xs opacity-60 mt-1">
                  Letters, numbers, dashes. We’ll suggest one from the name if blank.
                </p>
              </div>

              <div>
                <label className="block text-sm opacity-80 mb-1">Avatar URL (optional)</label>
                <input
                  name="avatar_url"
                  placeholder="https://…"
                  className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm opacity-80 mb-1">Banner URL (optional)</label>
                <input
                  name="banner_url"
                  placeholder="https://…"
                  className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm opacity-80 mb-1">Description</label>
                <textarea
                  name="description"
                  maxLength={240}
                  rows={4}
                  placeholder="What’s this group about and who should join?"
                  className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20"
                />
                <p className="text-xs opacity-60 mt-1">Keep it short and inviting (up to 240 chars).</p>
              </div>

              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button className="btn-cta" type="submit">
                  Create group
                </button>
                <a href="/discover?tab=groups" className="btn-ghost">
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}