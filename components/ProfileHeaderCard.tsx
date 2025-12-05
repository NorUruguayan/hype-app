'use client';

import { useEffect, useMemo, useState } from 'react';
import { getClient } from '@/lib/supabase/client';
import FollowButton from './FollowButton';

type Profile = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

type Props = {
  profile: Profile;
  viewerId: string | null;
  initialIsFollowing: boolean;
  followersCount?: number;
  followingCount?: number;
};

export default function ProfileHeaderCard({
  profile,
  viewerId,
  initialIsFollowing,
  followersCount: followersCountProp,
  followingCount: followingCountProp,
}: Props) {
  const supabase = useMemo(() => getClient(), []);
  const isOwnProfile = !!viewerId && viewerId === profile.user_id;

  const [followersCount, setFollowersCount] = useState<number | null>(
    typeof followersCountProp === 'number' ? followersCountProp : null
  );
  const [followingCount, setFollowingCount] = useState<number | null>(
    typeof followingCountProp === 'number' ? followingCountProp : null
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      if (followersCount !== null && followingCount !== null) return;

      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('followee_id', profile.user_id),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profile.user_id),
      ]);

      if (!cancelled) {
        setFollowersCount(followersRes.count ?? 0);
        setFollowingCount(followingRes.count ?? 0);
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [profile.user_id, supabase, followersCount, followingCount]);

  const handleFollowToggle = (nowFollowing: boolean) => {
    setFollowersCount((n) => {
      if (typeof n !== 'number') return n;
      return nowFollowing ? n + 1 : Math.max(0, n - 1);
    });
  };

  return (
    <section className="ui-card p-5">
      <div className="flex items-start gap-4">
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name || profile.username || 'Avatar'}
        />

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            {profile.display_name || profile.username || 'User'}
          </h1>
          <div className="text-sm opacity-70 truncate">
            {profile.username ? `@${profile.username}` : 'username not set'}
          </div>
        </div>

        {!isOwnProfile && !!viewerId && (
          <FollowButton
            targetId={profile.user_id}
            initialIsFollowing={initialIsFollowing}
            onToggle={handleFollowToggle}
          />
        )}
      </div>

      {profile.bio && (
        <p className="mt-4 whitespace-pre-wrap leading-relaxed opacity-90">
          {profile.bio}
        </p>
      )}

      <div className="mt-4 flex gap-6 text-sm">
        <Count label="Followers" value={followersCount} />
        <Count label="Following" value={followingCount} />
      </div>
    </section>
  );
}

/* helpers */

function Avatar({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="size-16 rounded-full bg-white/10 grid place-items-center text-xs opacity-70 select-none">
        No avatar
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="size-16 rounded-full object-cover"
    />
  );
}

function Count({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="font-semibold">{value ?? '—'}</div>
      <div className="opacity-70 text-xs">{label}</div>
    </div>
  );
}