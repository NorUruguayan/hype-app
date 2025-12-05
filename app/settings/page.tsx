// app/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import PageTheme from "@/components/PageTheme";

import ToastProvider from "@/components/ToastProvider.client";
import ToastListener from "@/components/ToastListener.client";

import AvatarPreview from "@/components/AvatarPreview.client";
import UsernameField from "@/components/UsernameField.client";
import ThemePicker from "@/components/ThemePicker.client";
import BioWithCounter from "@/components/BioWithCounter.client";
import DangerZone from "@/components/DangerZone.client";

import { saveDiscoveryTags, refreshDmAnalytics } from "@/app/actions/settings";

type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  settings: any | null;
  city: string | null;
  school: string | null;
};

export const dynamic = "force-dynamic";

/** Server action: save profile (your rich version, returns void via redirect) */
async function saveProfile(formData: FormData) {
  "use server";
  const supabase = await getServerClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) redirect("/login");

  const display_name = (formData.get("display_name") as string)?.trim().slice(0, 60) || null;
  const username = (formData.get("username") as string)?.trim().toLowerCase().slice(0, 30) || null;
  const bio = (formData.get("bio") as string)?.trim().slice(0, 160) || null;
  const avatarUrlInput = (formData.get("avatar_url") as string)?.trim() || "";
  const prefTheme = (formData.get("pref_theme") as string) as "system" | "light" | "dark" | undefined;

  // merge privacy + notifications
  const { data: current } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", user.id)
    .maybeSingle<{ settings: any | null }>();

  const nextSettings = {
    ...((current?.settings as Record<string, any>) ?? {}),
    privacy: {
      ...(current?.settings?.privacy ?? {}),
      profile_private: formData.get("privacy_profile_private") === "on",
      allow_invites: formData.get("privacy_allow_invites") === "on",
      show_followers: formData.get("privacy_show_followers") === "on",
    },
    notifications: {
      ...(current?.settings?.notifications ?? {}),
      daily_reminder: formData.get("notif_daily_reminder") === "on",
      new_followers: formData.get("notif_new_followers") === "on",
      mentions: formData.get("notif_mentions") === "on",
    },
  };

  // theme cookie
  if (prefTheme) {
    const store = await cookies();
    store.set("pref_theme", prefTheme, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }

  // optional avatar upload
  let finalAvatarUrl: string | null = avatarUrlInput || null;
  const file = formData.get("avatar_file") as File | null;
  if (file && file.size > 0) {
    try {
      const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
      const path = `${user.id}/${Date.now()}.${ext || "jpg"}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        if (pub?.publicUrl) finalAvatarUrl = pub.publicUrl;
      }
    } catch {
      // ignore
    }
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    display_name,
    username,
    bio,
    avatar_url: finalAvatarUrl,
    settings: nextSettings,
    updated_at: new Date().toISOString(),
  });

  redirect("/settings?toast=saved");
}

/** Server action: delete account */
async function deleteAccount() {
  "use server";
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try { await supabase.from("profiles").delete().eq("id", user.id); } catch {}
  try { await supabase.auth.admin.deleteUser(user.id); } catch {}
  redirect("/goodbye?toast=deleted");
}

/* -------------------------------------------
   WRAPPERS so <form action={...}> returns void
-------------------------------------------- */

/** Wrap saveDiscoveryTags to satisfy action type */
async function saveDiscoveryTagsAction(formData: FormData): Promise<void> {
  "use server";
  await saveDiscoveryTags(formData);
}

/** Wrap refreshDmAnalytics to satisfy action type */
async function refreshDmAnalyticsAction(): Promise<void> {
  "use server";
  await refreshDmAnalytics();
}

export default async function SettingsPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, bio, settings, city, school")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const initialName =
    profile?.display_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.email ? user.email.split("@")[0] : "") ??
    "";

  const initialUsername =
    profile?.username ??
    (user.user_metadata?.username as string | undefined) ??
    "";

  const initialBio = profile?.bio ?? "";
  const initialAvatar = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string) ?? "";

  const store = await cookies();
  const themeCookie = store.get("pref_theme")?.value as "system" | "light" | "dark" | undefined;
  const defaultTheme = themeCookie ?? "system";

  const s = (profile?.settings ?? {}) as any;
  const privacy = s.privacy ?? {};
  const notifications = s.notifications ?? {};

  return (
    <>
      <PageTheme name="sand" />
      <ToastProvider>
        <ToastListener />

        <div className="app-container py-8">
          <div className="ui-card overflow-hidden">
            <div className="brand-gradient h-28" aria-hidden />
            <div className="p-5 md:p-6">
              <div className="-mt-10 mb-4 flex items-end gap-4">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
                  {initialAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={initialAvatar} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{(initialName || "U")?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="pb-2">
                  <h1 className="text-2xl font-semibold leading-tight">Edit profile</h1>
                  <p className="opacity-75 text-sm">Make it yours — add a name, username, bio, avatar, theme, and privacy.</p>
                </div>
              </div>

              {/* Main Profile Form */}
              <form action={saveProfile} className="grid gap-6 md:grid-cols-2">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm opacity-80 mb-1">Display name</label>
                    <input
                      name="display_name"
                      defaultValue={initialName}
                      maxLength={60}
                      placeholder="Your name"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm opacity-80 mb-1">Username</label>
                    <UsernameField defaultValue={initialUsername ?? ""} currentUserId={user.id} />
                  </div>

                  <div>
                    <label className="block text-sm opacity-80 mb-1">Bio</label>
                    <BioWithCounter defaultValue={initialBio} />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <ThemePicker defaultValue={defaultTheme} />

                  <div>
                    <label className="block text-sm opacity-80 mb-1 mt-2">Avatar URL (optional)</label>
                    <input
                      name="avatar_url"
                      defaultValue={initialAvatar}
                      placeholder="https://…"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                    />
                    <p className="text-xs opacity-60 mt-1">Paste an image URL to use instantly.</p>
                  </div>

                  <div>
                    <label className="block text-sm opacity-80 mb-1">Or upload an image</label>
                    <AvatarPreview inputName="avatar_file" />
                    <p className="text-xs opacity-60 mt-1">JPG, PNG, or WEBP. We’ll host it for you.</p>
                  </div>
                </div>

                {/* Privacy + Notifications */}
                <div className="md:col-span-2 ui-card p-4 md:p-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <fieldset>
                      <legend className="text-sm font-semibold mb-3">Privacy</legend>
                      <label className="flex items-center gap-3 mb-2">
                        <input type="checkbox" name="privacy_profile_private" defaultChecked={!!privacy.profile_private} className="h-4 w-4" />
                        <span className="text-sm">Make my profile private</span>
                      </label>
                      <label className="flex items-center gap-3 mb-2">
                        <input type="checkbox" name="privacy_allow_invites" defaultChecked={privacy.allow_invites ?? true} className="h-4 w-4" />
                        <span className="text-sm">Allow friend invites</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" name="privacy_show_followers" defaultChecked={privacy.show_followers ?? true} className="h-4 w-4" />
                        <span className="text-sm">Show my follower/following counts</span>
                      </label>
                    </fieldset>

                    <fieldset>
                      <legend className="text-sm font-semibold mb-3">Notifications</legend>
                      <label className="flex items-center gap-3 mb-2">
                        <input type="checkbox" name="notif_daily_reminder" defaultChecked={notifications.daily_reminder ?? true} className="h-4 w-4" />
                        <span className="text-sm">Daily hype reminder</span>
                      </label>
                      <label className="flex items-center gap-3 mb-2">
                        <input type="checkbox" name="notif_new_followers" defaultChecked={notifications.new_followers ?? true} className="h-4 w-4" />
                        <span className="text-sm">New followers</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" name="notif_mentions" defaultChecked={notifications.mentions ?? true} className="h-4 w-4" />
                        <span className="text-sm">Mentions</span>
                      </label>
                    </fieldset>
                  </div>
                </div>

                {/* Save + Cancel */}
                <div className="md:col-span-2 pt-2 flex items-center gap-2">
                  <button className="btn-cta" type="submit">Save profile</button>
                  <a className="btn-ghost" href="/me">Cancel</a>
                </div>
              </form>

              {/* Discovery Tags */}
              <div className="mt-8 ui-card p-4 md:p-5">
                <h2 className="text-sm font-semibold mb-3">Discovery tags</h2>
                <p className="text-sm opacity-75 mb-3">
                  Your city and school help surface relevant groups in <span className="font-medium">Discover → Suggested for you</span>.
                </p>
                <form action={saveDiscoveryTagsAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-xs opacity-70 mb-1">City</div>
                    <input
                      name="city"
                      defaultValue={profile?.city ?? ""}
                      placeholder="e.g., Orangeville"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs opacity-70 mb-1">School</div>
                    <input
                      name="school"
                      defaultValue={profile?.school ?? ""}
                      placeholder="e.g., Central High"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button className="rounded-lg px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium">
                      Save tags
                    </button>
                  </div>
                </form>
              </div>

              {/* DM Analytics */}
              <div className="mt-6 ui-card p-4 md:p-5">
                <h2 className="text-sm font-semibold mb-3">DM analytics</h2>
                <p className="text-sm opacity-75 mb-3">
                  We use your top DM contacts to recommend groups where your close friends hang out.
                  Click refresh after lots of new messages.
                </p>
                <form action={refreshDmAnalyticsAction}>
                  <button className="rounded-lg px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition text-sm">
                    Refresh DM analytics
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="mt-10">
                <DangerZone onDeleteAccount={deleteAccount} />
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </>
  );
}