// components/ProfileHeaderGlobal.tsx
import { getServerClient, getServerUser } from "@/lib/supabase/server";
import { getStreakForUser } from "@/lib/streaks";
import Link from "next/link";

type ProfileRow = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default async function ProfileHeaderGlobal({ username }: { username: string }) {
  const { supabase, user: viewer } = await getServerUser();

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle<ProfileRow>();

  if (!profile) {
    // Render a soft-empty state; the page still 404s above if not found.
    return (
      <section className="ui-card p-5">
        <div className="opacity-70">Profile not found.</div>
      </section>
    );
  }

  // Counts
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase
      .from("follows")
      .select("followee_id", { count: "exact", head: true })
      .eq("followee_id", profile.user_id),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("follower_id", profile.user_id),
  ]);

  // Streak
  const streak = await getStreakForUser(profile.user_id);

  const isOwn = viewer?.id === profile.user_id;
  const display = profile.display_name || profile.username || "User";

  return (
    <section className="ui-card p-5">
      <div className="flex items-start gap-4">
        <Avatar src={profile.avatar_url} alt={display} />

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{display}</h1>
          <div className="text-sm opacity-70 truncate">
            {profile.username ? `@${profile.username}` : "username not set"}
          </div>

          {/* Streak + counts */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <StreakPill
              streak={streak.streak}
              hasHypedToday={streak.hasHypedToday}
            />
            <Count label="Followers" value={followersCount ?? 0} />
            <Count label="Following" value={followingCount ?? 0} />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {!isOwn && (
            <Link
              href={`/invite`}
              className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm"
            >
              Say hi 👋
            </Link>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="mt-4 whitespace-pre-wrap leading-relaxed opacity-90">
          {profile.bio}
        </p>
      )}
    </section>
  );
}

/* --- visuals --- */

function Avatar({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div
        className="size-16 rounded-full bg-white/10 grid place-items-center text-xs opacity-70 select-none"
        aria-label="No avatar"
      >
        No avatar
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className="size-16 rounded-full object-cover bg-white/10"
      draggable={false}
    />
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full bg-white/5 px-3 py-1 text-sm">
      <span className="font-semibold">{Intl.NumberFormat().format(value)}</span>{" "}
      <span className="opacity-70">{label}</span>
    </div>
  );
}

function StreakPill({
  streak,
  hasHypedToday,
}: {
  streak: number;
  hasHypedToday: boolean;
}) {
  const text = hasHypedToday
    ? `🔥 ${streak}-day streak`
    : streak > 0
    ? `⚠️ ${streak}-day streak — hype today to keep it!`
    : "Start your first streak today";

  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 px-3 py-1 text-sm">
      {text}
    </span>
  );
}