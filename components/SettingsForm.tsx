"use client";

import * as React from "react";
import UsernameField from "@/components/UsernameField.client";
import ThemeSelect, { Theme } from "@/components/ThemeSelect.client";
import {
  saveProfile,
  savePrefs,
  signOutOthers,
  deleteAccount,
} from "@/app/actions/settings";

type Prefs = {
  theme: Theme;
  discoverable: boolean;
  allow_dm: boolean;
  show_activity: boolean;
  hide_counts: boolean;
  email_updates: boolean;
  email_mentions: boolean;
  email_followers: boolean;
};

type Props = {
  userId: string;
  initialDisplayName: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl?: string;
  initialPrefs: Prefs;
};

export default function SettingsForm({
  userId,
  initialDisplayName,
  initialUsername,
  initialBio,
  initialAvatarUrl = "",
  initialPrefs,
}: Props) {
  const [displayName, setDisplayName] = React.useState(initialDisplayName);
  const [username, setUsername] = React.useState(initialUsername);
  const [usernameOK, setUsernameOK] = React.useState<boolean | null>(null);
  const [bio, setBio] = React.useState(initialBio);
  const [avatarUrl, setAvatarUrl] = React.useState(initialAvatarUrl);

  const [theme, setTheme] = React.useState<Theme>(initialPrefs.theme);
  const [discoverable, setDiscoverable] = React.useState(initialPrefs.discoverable);
  const [allowDM, setAllowDM] = React.useState(initialPrefs.allow_dm);
  const [showActivity, setShowActivity] = React.useState(initialPrefs.show_activity);
  const [hideCounts, setHideCounts] = React.useState(initialPrefs.hide_counts);
  const [emailUpdates, setEmailUpdates] = React.useState(initialPrefs.email_updates);
  const [emailMentions, setEmailMentions] = React.useState(initialPrefs.email_mentions);
  const [emailFollowers, setEmailFollowers] = React.useState(initialPrefs.email_followers);

  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  // -------- Save profile basics --------
  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    // If the username changed, ensure it’s available before submitting
    if (
      username.trim().toLowerCase() !== initialUsername.trim().toLowerCase() &&
      usernameOK === false
    ) {
      setMessage("That username is taken. Please pick another.");
      setSaving(false);
      return;
    }

    const fd = new FormData();
    fd.set("display_name", displayName);
    fd.set("username", username);
    fd.set("bio", bio);
    fd.set("avatar_url", avatarUrl);

    const res = await saveProfile(fd);
    setSaving(false);
    setMessage(res.ok ? "Profile saved!" : res.error || "Could not save profile.");
  }

  // -------- Save preferences --------
  async function onSavePrefs() {
    setMessage(null);
    setSaving(true);

    const fd = new FormData();
    fd.set("theme", theme);
    fd.set("discoverable", discoverable ? "on" : "");
    fd.set("allow_dm", allowDM ? "on" : "");
    fd.set("show_activity", showActivity ? "on" : "");
    fd.set("hide_counts", hideCounts ? "on" : "");
    fd.set("email_updates", emailUpdates ? "on" : "");
    fd.set("email_mentions", emailMentions ? "on" : "");
    fd.set("email_followers", emailFollowers ? "on" : "");

    const res = await savePrefs(fd);
    setSaving(false);
    setMessage(res.ok ? "Preferences saved!" : res.error || "Could not save preferences.");
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="ui-card p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-semibold">
                {(displayName || username || "U")[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold">
              {displayName || "Your name"}
            </div>
            <div className="text-xs opacity-70">@{username || "username"}</div>
          </div>
        </div>
        {bio && <div className="mt-3 text-sm opacity-80">{bio}</div>}
      </div>

      {/* Profile form */}
      <form onSubmit={onSaveProfile} className="ui-card p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm opacity-80">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm opacity-80">Theme</label>
            <ThemeSelect initial={theme} onChange={setTheme} />
            <div className="mt-1 text-xs opacity-60">
              Applies instantly. We’ll remember your choice.
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <UsernameField
            value={username}
            onChange={setUsername}
            initial={initialUsername}
            excludeUserId={userId}
            requireNonEmpty
            onStatusChange={setUsernameOK}
          />

          <div>
            <label className="block text-sm opacity-80">Avatar URL (optional)</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2"
              placeholder="https://…"
            />
            <div className="mt-1 text-xs opacity-60">
              Paste an image URL to preview instantly. (Uploader can be added later.)
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm opacity-80">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={160}
            className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2"
            placeholder="Tell people what you’re hyped about…"
          />
          <div className="mt-1 text-xs opacity-60">{bio.length}/160</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-cta px-4 py-2 rounded-xl disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          {message && <div className="text-sm opacity-80">{message}</div>}
        </div>
      </form>

      {/* Advanced */}
      <details className="ui-card p-4">
        <summary className="cursor-pointer select-none text-sm">
          Advanced settings <span className="opacity-50">(privacy, notifications, sessions, danger zone)</span>
        </summary>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium opacity-80">Privacy</legend>

            <Toggle
              label="Discoverable (show my profile in Discover)"
              checked={discoverable}
              onChange={setDiscoverable}
            />
            <Toggle
              label="Allow direct messages"
              checked={allowDM}
              onChange={setAllowDM}
            />
            <Toggle
              label="Show activity status"
              checked={showActivity}
              onChange={setShowActivity}
            />
            <Toggle
              label="Hide Hype/Hyper counts on my profile"
              checked={hideCounts}
              onChange={setHideCounts}
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium opacity-80">Email</legend>

            <Toggle
              label="General updates"
              checked={emailUpdates}
              onChange={setEmailUpdates}
            />
            <Toggle
              label="Mentions & replies"
              checked={emailMentions}
              onChange={setEmailMentions}
            />
            <Toggle
              label="New followers"
              checked={emailFollowers}
              onChange={setEmailFollowers}
            />
          </fieldset>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onSavePrefs}
            disabled={saving}
            className="btn-cta px-4 py-2 rounded-xl disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </div>

        <div className="mt-6 h-px bg-white/10" />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-ghost px-3 py-2 rounded-xl"
            onClick={async () => {
              setMessage(null);
              const res = await signOutOthers();
              setMessage(res.ok ? "Signed out of other sessions." : "Couldn’t sign out others.");
            }}
          >
            Sign out other sessions
          </button>

          <button
            type="button"
            className="rounded-xl px-3 py-2 text-sm bg-red-600/20 ring-1 ring-red-500/40 hover:bg-red-600/25"
            onClick={async () => {
              if (!confirm("Permanently delete your account? This cannot be undone.")) return;
              const res = await deleteAccount();
              setMessage(res.ok ? "Deleted (stub)." : res.error || "Couldn’t delete.");
            }}
          >
            Delete account
          </button>
        </div>
      </details>
    </div>
  );
}

/* ---------- Small bits ---------- */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mt-2 flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 accent-amber-400"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}