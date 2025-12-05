// app/invite/page.tsx
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import PageTheme from "@/components/PageTheme";
import InvitePanel from "@/components/InvitePanel";
import { IconGear, IconSparkles } from "@/components/icons";

type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
};

export default async function InvitePage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, banner_url")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const name =
    profile?.display_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.email ? user.email.split("@")[0] : "Your name");

  const handle =
    (profile?.username && `@${profile.username}`) ||
    (user.user_metadata?.username ? `@${user.user_metadata.username}` : "@username");

  const avatar = profile?.avatar_url || "";

  const { data: invites } = await supabase
    .from("invites")
    .select("accepted_at")
    .eq("inviter_id", user.id);

  const sent = invites?.length ?? 0;
  const accepted = invites?.filter((i) => i.accepted_at).length ?? 0;

  return (
    <>
      <PageTheme name="teal" />
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* Profile-style header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.03]">
          <div className="h-40 brand-gradient" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end justify-between">
              <div className="flex items-end gap-4">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{name?.[0]?.toUpperCase() ?? "U"}</span>
                  )}
                </div>
                <div className="pb-2">
                  <div className="text-2xl font-semibold leading-tight">{name}</div>
                  <div className="opacity-70">{handle}</div>
                </div>
              </div>

              <div className="flex gap-2 pb-2">
                <a
                  href="/settings"
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 transition inline-flex items-center gap-2"
                >
                  <IconGear width={16} height={16} className="opacity-90" />
                  Edit Profile
                </a>
                <a
                  href="/invite"
                  className="rounded-xl bg-yellow-500 px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 transition inline-flex items-center gap-2"
                >
                  <IconSparkles width={16} height={16} />
                  Invite friends
                </a>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:w-2/3 lg:w-1/2">
              <div className="rounded-xl border border-white/10 p-3">
                <div className="opacity-70">Invites accepted</div>
                <div className="text-lg font-semibold">{accepted}</div>
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <div className="opacity-70">Invites sent</div>
                <div className="text-lg font-semibold">{sent}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h1 className="text-3xl font-bold">Invite friends</h1>
          <p className="mt-2 opacity-80">
            Share your HYPED page so friends can hype you up for interviews, first days, big games—anything you need a boost for.
          </p>
        </div>

        <div className="mt-6">
          <InvitePanel />
        </div>
      </div>
    </>
  );
}