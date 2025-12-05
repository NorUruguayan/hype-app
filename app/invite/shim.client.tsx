'use client'

import { useState } from 'react'

export default function InviteClient({ initialShareUrl }: { initialShareUrl: string }) {
  const [shareUrl, setShareUrl] = useState(initialShareUrl)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied!')
    } catch {
      alert('Copy failed. You can select the text manually.')
    }
  }

  const mailto = () =>
    `mailto:?subject=Come hype me up on HYPE&body=${encodeURIComponent(
      `Join me on HYPE and send some encouragement: ${shareUrl}\n\n` +
        `“Start getting hyped for your first day of school, a big date, a job interview, an exam — or anything you’ve got coming up.”`
    )}`

  const sms = () =>
    `sms:?&body=${encodeURIComponent(
      `HYPE me up here: ${shareUrl} — “Get hyped for your first day of school, a big date, a job interview, an exam, or anything coming up.”`
    )}`

  const webShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HYPE — Get Hyped',
          text: 'Hype me up for my upcoming thing — drop a quick message!',
          url: shareUrl,
        })
      } catch {}
    } else {
      copy()
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-2xl font-extrabold">Invite friends</h1>
      <p className="text-white/70 mt-2">
        Share your HYPE page so friends can hype you up for interviews, first days, big games, exams—anything
        you need a boost for.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
        <label className="block text-sm text-white/70 mb-2">Your share link</label>
        <div className="flex gap-2">
          <input
            value={shareUrl}
            onChange={(e) => setShareUrl(e.target.value)}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 outline-none text-white"
          />
          <button
            onClick={copy}
            className="px-4 py-3 rounded-xl brand-gradient text-white shadow-brand hover:opacity-90 transition"
          >
            Copy
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={mailto()}
            className="rounded-full px-4 py-2 brand-gradient text-white shadow-brand hover:opacity-90 transition"
          >
            Email invite
          </a>
          <a
            href={sms()}
            className="rounded-full px-4 py-2 brand-gradient text-white shadow-brand hover:opacity-90 transition"
          >
            SMS invite
          </a>
          <button
            onClick={webShare}
            className="rounded-full px-4 py-2 brand-gradient text-white shadow-brand hover:opacity-90 transition"
          >
            Share (native)
          </button>
        </div>

        <p className="mt-4 text-xs text-white/60">
          Need a line to include? Try: “Start getting hyped for your first day of school, a big date, a job
          interview, an exam, or anything you’ve got coming up.”
        </p>
      </div>
    </main>
  )
}