// FILE: components/DemoHypeComposer.tsx
'use client'

import { useState } from 'react'

type Msg = { id: string; content: string; created_at: string }

export default function DemoHypeComposer({
  initial,
}: {
  initial: Msg[]
}) {
  const [msgs, setMsgs] = useState<Msg[]>(() => initial)
  const [text, setText] = useState('You’ve got this! 💪')

  const post = () => {
    const content = text.trim()
    if (!content) return
    const m: Msg = {
      id: crypto.randomUUID(),
      content,
      created_at: new Date().toISOString(),
    }
    // Add to top with a tiny “pop” animation class
    setMsgs((prev) => [m, ...prev])
    setText('') // clear
  }

  return (
    <div className="mt-4">
      {/* composer */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write some hype…"
          className="flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-white placeholder-white/40 outline-none focus:border-white/30"
        />
        <button
          onClick={post}
          className="brand-gradient text-white px-4 py-2 rounded-full font-semibold shadow-brand disabled:opacity-60"
          disabled={!text.trim()}
          type="button"
        >
          Send Hype ⚡
        </button>
      </div>

      {/* list */}
      {msgs.length === 0 ? (
        <div className="text-white/60 text-sm mt-3">
          No messages yet. Be the first to send hype!
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {msgs.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3 demo-pop"
            >
              <div className="text-white">{m.content}</div>
              <div className="text-white/50 text-xs mt-1">
                {new Date(m.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}