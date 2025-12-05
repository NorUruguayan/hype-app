// components/discover/FollowButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({
  viewerId,
  targetId,
  initialIsFollowing,
}: {
  viewerId: string
  targetId: string
  initialIsFollowing: boolean
}) {
  const supabase = createClient()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [pending, startTransition] = useTransition()

  const canFollow = viewerId !== targetId

  async function toggle() {
    if (!canFollow) return
    startTransition(async () => {
      setIsFollowing(v => !v)

      if (!isFollowing) {
        const { error } = await supabase.from('follows').insert({
          follower_id: viewerId,
          followee_id: targetId,
        })
        if (error) setIsFollowing(false)
      } else {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', viewerId)
          .eq('followee_id', targetId)
        if (error) setIsFollowing(true)
      }
    })
  }

  if (!canFollow) {
    return (
      <button disabled className="rounded-pill px-4 h-9 bg-white/10 border border-white/10 text-sm opacity-60">
        You
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded-pill px-4 h-9 text-sm ${
        isFollowing ? 'bg-white/10 border border-white/10 hover:bg-white/15' : 'btn-brand'
      }`}
    >
      {pending ? '…' : isFollowing ? 'Following' : '+ Hype'}
    </button>
  )
}