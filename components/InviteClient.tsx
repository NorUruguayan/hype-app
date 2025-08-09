// FILE: components/InviteClient.tsx
'use client'

import { useState } from 'react'

export default function InviteClient({
  shareUrl,
  username,
  displayName,
}: {
  shareUrl: string
  username?: string
  displayName?: string
}) {
  const [copied, setCopied] = useState(false)

  const slogan = 'GET HYPED'
  const who = displayName || (username ? `@${username}` : 'me')
  const bodyText = `Hey! ${slogan} with ${who} on HYPE.\n\n` +
    `Drop a quick hype for upcoming stuff (interviews, first day of school, big games, exams).\n\n` +
    `${shareUrl}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback: no-op
    }
  }

  function mailInvite() {
    const subject = `${slogan} for ${who}`
    const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`
    window.location.href = href
  }

  function smsInvite() {
    const href = `sms:?&body=${encodeURIComponent(bodyText)}`
    window.location.href = href
  }

  async function nativeShare() {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `HYPE — ${slogan}`,
          text: bodyText,
          url: shareUrl,
        })
      } catch {
        // user cancelled
      }
    } else {
      copyLink()
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-white">
      <div className="mb-4">
        <div className="text-sm text-white/60 mb-1">Your share link</div>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white outline-none"
          />
          <button
            onClick={copyLink}
            className="rounded-xl px-4 py-3 font-semibold text-white shadow-brand brand-gradient"
            title="Copy link"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={mailInvite}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white/90 hover:bg-white/10"
        >
          Email invite
        </button>

        <button
          onClick={smsInvite}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white/90 hover:bg-white/10"
        >
          SMS invite
        </button>

        <button
          onClick={nativeShare}
          className="rounded-xl px-4 py-3 font-semibold text-white shadow-brand brand-gradient"
        >
          Share (native)
        </button>
      </div>

      <div className="mt-6 text-sm text-white/70">
        Need a line to include? Try:&nbsp;
        <span className="text-white/90">
          “Start getting hyped for your first day of school, a big date, a job interview,
          an exam, or anything you’ve got coming up.”
        </span>
      </div>
    </div>
  )
}