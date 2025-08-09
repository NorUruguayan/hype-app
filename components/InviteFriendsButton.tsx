'use client'

import { useState } from 'react'

export default function InviteFriendsButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    const url = new URL(path, window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback if clipboard is blocked
      alert('Profile link: ' + url)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-full px-4 py-2 font-semibold text-white shadow-brand hover:opacity-90 active:opacity-95 transition
                 bg-gradient-to-r from-[#6AA6FF] to-[#9E5BFF]"
    >
      {copied ? 'Copied!' : 'Invite friends'}
    </button>
  )
}