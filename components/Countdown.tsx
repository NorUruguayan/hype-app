// FILE: components/Countdown.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = { to: string } // ISO datetime

function format(ms: number) {
  if (ms <= 0) return 'Now'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export default function Countdown({ to }: Props) {
  const target = useMemo(() => new Date(to).getTime(), [to])
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const label = format(target - now)

  // Render only on client; server will serialize a boundary for this component,
  // so no text is sent that could mismatch.
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
      {label}
    </span>
  )
}