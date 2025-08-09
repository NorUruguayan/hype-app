// FILE: components/ClientDate.tsx
'use client'

import { useEffect, useState } from 'react'

/**
 * Renders a date *only after mount* to avoid SSR/CSR locale mismatches.
 */
export default function ClientDate({ dateString }: { dateString?: string | null }) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (!dateString) return
    // Format however you like; this runs only on the client
    setText(
      new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
      })
    )
  }, [dateString])

  return <span>{text}</span>
}