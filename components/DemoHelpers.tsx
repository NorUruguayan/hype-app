// FILE: components/DemoHelpers.tsx
'use client'

import { useEffect } from 'react'

export default function ScrollToDailyOnLoad() {
  useEffect(() => {
    const wantsDaily =
      window.location.hash === '#daily' ||
      new URLSearchParams(window.location.search).get('focus') === 'daily'

    if (!wantsDaily) return

    // Defer a tick so layout exists
    requestAnimationFrame(() => {
      const el = document.getElementById('daily')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  return null
}