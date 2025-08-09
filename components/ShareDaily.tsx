// FILE: components/ShareDaily.tsx
'use client'

import { useMemo, useState } from 'react'

export default function ShareDaily({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)

  const url = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/u/${username}/daily`
  }, [username])

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Daily Hype',
          text: 'Send me some hype!',
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }
    } catch {
      // ignore cancel
    }
  }

  return (
    <button
      onClick={share}
      type="button"
      className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 transition"
    >
      {copied ? 'Link Copied ✓' : 'Share Daily Hype'}
    </button>
  )
}