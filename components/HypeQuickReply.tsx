'use client'

import { useState, useTransition } from 'react'

export default function HypeQuickReply({ hypeId }: { hypeId: string }) {
  const [text, setText] = useState('')
  const [pending, start] = useTransition()
  const [ok, setOk] = useState<boolean | null>(null)

  const send = () => {
    if (!text.trim()) return
    start(async () => {
      try {
        const res = await fetch('/api/hype/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, in_reply_to: hypeId }),
        })
        if (!res.ok) throw new Error(await res.text())
        setOk(true)
        setText('')
      } catch {
        setOk(false)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <label className="mb-2 block text-sm text-white/70">Send hype to the author</label>
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="You’ve got this! 💪"
          className="flex-1 resize-none rounded-xl border border-white/15 bg-white/[0.06] p-3 text-white outline-none"
          rows={2}
        />
        <button
          onClick={send}
          disabled={pending || !text.trim()}
          className="self-end rounded-full px-4 py-2 brand-gradient text-white shadow-brand disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send Hype ⚡'}
        </button>
      </div>
      {ok === true && <p className="mt-2 text-xs text-green-300">Sent!</p>}
      {ok === false && <p className="mt-2 text-xs text-red-300">Couldn’t send hype. Try again.</p>}
    </div>
  )
}