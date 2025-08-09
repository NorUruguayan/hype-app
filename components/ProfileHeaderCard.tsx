'use client'

import Link from 'next/link'
import { useState } from 'react'
import FollowButton from '@/components/FollowButton'
import FollowListModal from '@/components/FollowListModal'

export default function ProfileHeaderCard({
  userId,
  username,
  displayName,
  bio,
  hypeCount,
  followersCount,
  followingCount,
}: {
  userId: string
  username: string
  displayName: string
  bio: string
  hypeCount: number
  followersCount: number
  followingCount: number
}) {
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 shadow-brand text-white">
      <div className="grid grid-cols-[auto,1fr,auto] items-start gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold">
          {(displayName?.[0] || username[0] || 'H').toUpperCase()}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <Link href={`/@${username}`} className="hover:underline">{displayName}</Link>
          </h1>
          <p className="text-white/70">@{username}</p>
          {bio && <p className="text-white/80 mt-3">{bio}</p>}

          <div className="mt-5 flex flex-wrap gap-2">
            {/* Hype up = solid gradient pill */}
            <Link
              href={`/@${username}#hype`}
              className="brand-gradient text-white px-4 py-2 rounded-full font-semibold shadow-brand hover:opacity-90 active:opacity-95 transition"
            >
              Hype up ⚡
            </Link>

            {/* Get Hyped = brighter gradient + subtle ring */}
            <Link
              href={`/u/${username}/daily`}
              className="px-4 py-2 rounded-full font-semibold text-white shadow-brand hover:opacity-90 active:opacity-95 transition
                         bg-gradient-to-r from-[#6AA6FF] to-[#9E5BFF] ring-1 ring-white/10"
            >
              Get Hyped ↗
            </Link>

            <FollowButton profileUserId={userId} />
          </div>
        </div>

        <div className="justify-self-end text-right space-y-2">
          <div className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/10">
            <div className="text-xl md:text-2xl font-extrabold leading-none">{hypeCount}</div>
            <div className="text-xs tracking-wide text-white/60">Hypes</div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-right hover:bg-white/10"
              onClick={() => setShowFollowers(true)}
            >
              <div className="text-sm font-bold leading-none">{followersCount}</div>
              <div className="text-[11px] tracking-wide text-white/60">Hypers</div>
            </button>
            <button
              className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-right hover:bg-white/10"
              onClick={() => setShowFollowing(true)}
            >
              <div className="text-sm font-bold leading-none">{followingCount}</div>
              <div className="text-[11px] tracking-wide text-white/60">Hypees</div>
            </button>
          </div>
        </div>
      </div>

      <FollowListModal
        userId={userId}
        mode="followers"
        open={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Hypers (followers)"
      />
      <FollowListModal
        userId={userId}
        mode="following"
        open={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Hypees (following)"
      />
    </section>
  )
}