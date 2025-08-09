// FILE: components/HypeActions.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = { userId: string; username: string }

export default function HypeActions({ userId, username }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const search = useSearchParams()

  const [openCompose, setOpenCompose] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  // detect own profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id === userId) setIsOwnProfile(true)
    })()
  }, [supabase, userId])

  // open compose if returning with ?compose=1
  useEffect(() => {
    if (search?.get('compose') === '1') setOpenCompose(true)
  }, [search])

  const profileUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/u/${username}`
  }, [username])

  const requestLink = useMemo(() => `${profileUrl}?compose=1`, [profileUrl])

  const startCompose = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const returnTo = encodeURIComponent(`/u/${username}?compose=1`)
      router.push(`/login?next=${returnTo}`)
      return
    }
    setOpenCompose(true)
  }

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) throw new Error('Please log in to post a hype.')

      const content = text.trim()
      if (!content) throw new Error('Write something!')

      const { error: insErr } = await supabase.from('hypes').insert({
        from_user_id: user.id,
        to_user_id: userId,
        content,
      })
      if (insErr) throw insErr

      setText('')
      setOpenCompose(false)
      router.refresh?.()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to post hype.')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(requestLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const systemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hype @${username}`,
          text: `Send a hype to @${username}!`,
          url: requestLink,
        })
      } catch {}
    } else {
      setShowShare(true)
    }
  }

  // social fallbacks
  const encodedText = encodeURIComponent(`Send a hype to @${username}!`)
  const encodedUrl = encodeURIComponent(requestLink)
  const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
  const waUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
  const fbMsgUrl = `https://www.facebook.com/dialog/send?app_id=738026486351507&link=${encodedUrl}&redirect_uri=${encodedUrl}`
  const emailUrl = `mailto:?subject=Hype @${username}&body=${encodedText}%0A${encodedUrl}`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* PRIMARY — brand gradient */}
        <button
          onClick={startCompose}
          type="button"
          className="brand-gradient text-white px-5 py-3 rounded-full font-semibold shadow-brand hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition"
        >
          Hype up ⚡
        </button>

        {/* SECONDARY — subtle pill; only for own profile */}
        {isOwnProfile && (
          <div className="relative">
            <button
              onClick={systemShare}
              type="button"
              className="px-5 py-3 rounded-full font-semibold border border-white/20 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition"
            >
              Hype Me ↗
            </button>

            {/* Fallback share menu */}
            {showShare && (
              <div className="absolute z-10 mt-2 w-80 rounded-2xl border border-white/10 bg-[color:var(--brand-dark)] p-3 shadow-brand">
                <div className="text-sm font-medium mb-2 text-white/90">Share your hype link</div>
                <div className="flex gap-2 mb-3">
                  <button className="border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 rounded text-sm" onClick={copyLink} type="button">
                    {copied ? 'Copied ✓' : 'Copy link'}
                  </button>
                  <button className="border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 rounded text-sm" onClick={() => window.open(xUrl, '_blank')} type="button">
                    Share on X
                  </button>
                  <button className="border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 rounded text-sm" onClick={() => window.open(waUrl, '_blank')} type="button">
                    WhatsApp
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 rounded text-sm" onClick={() => window.open(fbMsgUrl, '_blank')} type="button">
                    Messenger
                  </button>
                  <a className="border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 rounded text-sm inline-flex items-center" href={emailUrl}>
                    Email
                  </a>
                  <button className="ml-auto text-sm text-white/60" onClick={() => setShowShare(false)} type="button">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPOSER */}
      {openCompose && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <p className="mb-2">Hype up <b>@{username}</b></p>
          <textarea
            className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder-white/40 outline-none focus:border-white/30 mb-3"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your hype…"
          />
          {error && <div className="text-red-300 text-sm mb-2">{error}</div>}
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 transition"
              onClick={() => setOpenCompose(false)}
              disabled={loading}
              type="button"
            >
              Cancel
            </button>
            <button
              className="brand-gradient text-white px-4 py-2 rounded-full font-semibold shadow-brand hover:opacity-90 disabled:opacity-60 transition"
              onClick={submit}
              disabled={loading || !text.trim()}
              type="button"
            >
              {loading ? 'Posting…' : 'Post Hype'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}