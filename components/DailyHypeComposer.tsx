'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const QUOTES: Record<string, string[]> = {
  career: [
    'Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill',
    'Opportunities don’t happen. You create them. — Chris Grosser',
  ],
  school: [
    'Believe you can and you’re halfway there. — Theodore Roosevelt',
    'The beautiful thing about learning is no one can take it away from you. — B.B. King',
  ],
  sports: [
    'It’s not whether you get knocked down; it’s whether you get up. — Vince Lombardi',
    'Hard work beats talent when talent doesn’t work hard. — Tim Notke',
  ],
  personal: [
    'You are capable of amazing things.',
    'One step at a time. Keep going.',
  ],
}

export default function DailyHypeComposer({ eventId, username }: { eventId: string; username: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [text, setText] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true); setErr(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please log in to send hype.')
      const { error } = await supabase.from('daily_hype_messages').insert({
        event_id: eventId, from_user_id: user.id, content: text.trim(),
      })
      if (error) throw error
      setText('')
      router.refresh?.()
    } catch (e:any) {
      setErr(e?.message ?? 'Failed to send hype.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <p className="mb-2 text-sm">Send hype to <b>@{username}</b></p>
      <textarea
        rows={3}
        value={text}
        onChange={(e)=>setText(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
        placeholder="You’ve got this! 💪"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(QUOTES).map(([k, arr]) => (
          <details key={k} className="group">
            <summary className="cursor-pointer text-xs text-white/70 hover:text-white">{k} quotes</summary>
            <div className="mt-1 flex flex-wrap gap-2">
              {arr.map((q, i) => (
                <button
                  key={i}
                  className="text-xs px-2 py-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/10"
                  type="button"
                  onClick={() => setText(prev => (prev ? prev + ' ' + q : q))}
                >
                  + {q.slice(0, 28)}…
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
      {err && <div className="text-red-300 text-sm mt-2">{err}</div>}
      <div className="mt-2 flex gap-2">
        <button className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={()=>setText('')} type="button">
          Clear
        </button>
        <button className="brand-gradient text-white px-4 py-2 rounded-full font-semibold shadow-brand disabled:opacity-60" disabled={!text.trim() || loading} onClick={submit} type="button">
          {loading ? 'Sending…' : 'Send Hype ⚡'}
        </button>
      </div>
    </div>
  )
}