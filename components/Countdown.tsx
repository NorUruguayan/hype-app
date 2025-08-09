// FILE: components/Countdown.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

export default function Countdown({ to }: { to?: string | null }) {
  if (!to) return null

  const target = useMemo(() => new Date(to).getTime(), [to])
  const [now, setNow] = useState(() => Date.now())

  // tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = target - now

  // After the event time: show READY message
  if (diff <= 0) {
    return (
      <span className="ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/80">
        Thank you for the hypes — I’m READY! 💪⚡
      </span>
    )
  }

  // Before the event: show live countdown
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60

  const label =
    d > 0 ? `${d}d ${h}h`
    : h > 0 ? `${h}h ${m}m`
    : m > 0 ? `${m}m ${sec}s`
    : `${sec}s`

  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
      in {label}
    </span>
  )
}