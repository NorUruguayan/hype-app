// components/ProfileSettingsCard.client.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import UsernameField from "@/components/UsernameField.client";
import ThemeSelect, { Theme } from "@/components/ThemeSelect.client";
import SettingsPreviewCard from "@/components/SettingsPreviewCard";

type Props = {
  initialDisplayName: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl?: string;
};

export default function ProfileSettingsCard({
  initialDisplayName,
  initialUsername,
  initialBio,
  initialAvatarUrl = "",
}: Props) {
  const supabase = React.useMemo(() => createClient(), []);

  // form state
  const [displayName, setDisplayName] = React.useState(initialDisplayName);
  const [username, setUsername] = React.useState(initialUsername);
  const [bio, setBio] = React.useState(initialBio);
  const [avatarUrl, setAvatarUrl] = React.useState(initialAvatarUrl);

  // theme selector (ThemeSelect requires these props)
  const [theme, setTheme] = React.useState<Theme>("system");

  // username availability coming from UsernameField
  const [usernameOK, setUsernameOK] = React.useState<boolean | null>(null);

  // used so UsernameField doesn't count my own username as "taken"
  const [userId, setUserId] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, [supabase]);

  // save feedback
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string>("");

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) throw new Error("Not signed in.");

      const uname = username.trim().toLowerCase();
      if (!uname || usernameOK === false) {
        throw new Error("Please choose a valid, available username.");
      }

      const payload = {
        display_name: displayName.trim() || null,
        username: uname,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", user.id);

      if (error) throw error;
      setMsg("Saved ✓");
    } catch (err: any) {
      setMsg(err?.message || "Could not save.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2500);
    }
  }

  return (
    <section className="ui-card p-5 space-y-4">
      {/* Preview */}
      <SettingsPreviewCard
        displayName={displayName}
        username={username}
        bio={bio}
        avatarUrl={avatarUrl}
      />

      {/* Form grid */}
      <form onSubmit={onSave} className="grid gap-4 sm:grid-cols-2">
        {/* Left */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm opacity-80">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2"
              placeholder="Your name"
            />
          </div>

          <UsernameField
            value={username}
            onChange={setUsername}
            initial={initialUsername}
            excludeUserId={userId}
            requireNonEmpty
            onStatusChange={setUsernameOK}
          />

          <div className="space-y-1.5">
            <label className="block text-sm opacity-80">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={160}
              placeholder="Tell people what you’re hyped about..."
              className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2"
            />
            <div className="text-xs opacity-60">{bio.length}/160</div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm opacity-80">Theme</label>
            {/* FIX: ThemeSelect needs initial + onChange */}
            <ThemeSelect initial={theme} onChange={setTheme} />
            <div className="text-xs opacity-60">
              Applies instantly. We’ll remember your choice.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm opacity-80">Avatar URL (optional)</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2"
              placeholder="https://…"
            />
            <div className="text-xs opacity-60">
              Paste an image URL to preview instantly. (Uploader can be added later.)
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            className="btn-cta px-3.5 py-2 rounded-xl disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          <div className="text-sm opacity-70">{msg}</div>
        </div>
      </form>
    </section>
  );
}