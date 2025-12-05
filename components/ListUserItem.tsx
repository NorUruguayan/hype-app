import Link from "next/link";
import FollowButton from "@/components/FollowButton";
import { toggleFollow } from "@/app/actions/follow";

type ProfileLite = {
  id: string;                 // <-- If your data uses user_id, change to { id: string } = { id: profile.user_id }
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
};

export default function ListUserItem({
  profile,
  viewerId,
  initiallyFollowing,
  followsYou = false, // optional flag if you have this info
}: {
  profile: ProfileLite;
  viewerId: string | null;
  initiallyFollowing: boolean;
  followsYou?: boolean;
}) {
  const isSelf = !!viewerId && viewerId === profile.id;
  const name = profile.display_name || profile.username;
  const initial = (name?.[0] || "?").toUpperCase();

  return (
    <div className="ui-card px-4 py-3 flex items-center gap-3">
      {/* Avatar */}
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={name || profile.username}
          className="h-10 w-10 rounded-full object-cover bg-neutral-900"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-neutral-900 grid place-items-center text-sm opacity-80">
          {initial}
        </div>
      )}

      {/* Name/handle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold truncate">{name}</div>
          {followsYou ? (
            <span className="inline-flex items-center rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] opacity-80">
              follows you
            </span>
          ) : null}
        </div>
        <div className="text-sm opacity-70 truncate">@{profile.username}</div>
      </div>

      {/* Right: follow/unfollow (hide on yourself / logged-out -> link to login) */}
      <div className="flex items-center gap-2">
        {!isSelf ? (
          viewerId ? (
            <FollowButton
              targetId={profile.id}              // ✅ correct prop name
              initiallyFollowing={initiallyFollowing} // ✅ correct prop name
              action={toggleFollow}              // ✅ pass server action
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

        <Link
          href={`/u/${encodeURIComponent(profile.username)}`}
          className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          View
        </Link>
      </div>
    </div>
  );
}