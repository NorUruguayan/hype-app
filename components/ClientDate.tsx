'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  iso: string
  /** Optional explicit locale. Leave undefined to respect user’s browser locale. */
  locale?: string | string[]
  /** Intl options. Tweak as you like. */
  options?: Intl.DateTimeFormatOptions
  /** If true, show nothing until mounted (avoids SSR text entirely). */
  defer?: boolean
}

export default function ClientDate({
  iso,
  locale,
  options = { dateStyle: 'medium', timeStyle: 'short' },
  defer = true,
}: Props) {
  const dt = useMemo(() => new Date(iso), [iso])
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (defer && !mounted) {
    // Avoid any SSR text so hydration can't mismatch
    return <time dateTime={iso} />
  }

  const fmt = new Intl.DateTimeFormat(locale, options)
  const text = fmt.format(dt)

  return <time dateTime={iso}>{text}</time>
}