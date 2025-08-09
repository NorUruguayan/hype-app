'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export default function FollowButton({ profileUserId }: { profileUserId: string }) {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<boolean | null>(null)
  const [me, setMe] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMe(null); setFollowing(null); setLoading(false); return }
      setMe(user.id)

      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('followee_id', profileUserId)
        .maybeSingle()

      if (!mounted) return
      if (error && error.code !== 'PGRST116') console.error(error)
      setFollowing(!!data)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [profileUserId])

  if (!me || me === profileUserId) return null
  if (loading) {
    return <button className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white" disabled>…</button>
  }

  const toggle = async () => {
    const supabase = await createClient()
    if (!me) return
    if (following) {
      setFollowing(false)
      toast('Unfollowed')
      const { error } = await supabase.from('follows').delete().eq('follower_id', me).eq('followee_id', profileUserId)
      if (error) { setFollowing(true); toast('Error unfollowing') }
    } else {
      setFollowing(true)
      toast('Following')
      const { error } = await supabase.from('follows').insert({ follower_id: me, followee_id: profileUserId })
      if (error) { setFollowing(false); toast('Error following') }
    }
  }

  return (
    <button
      onClick={toggle}
      className={`px-4 py-2 rounded-full font-semibold border ${
        following
          ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
          : 'brand-gradient text-white shadow-brand'
      }`}
      disabled={loading}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}