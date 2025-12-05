// components/RecentHype.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Recent = {
  id: string
  content: string | null
  created_at: string
  username: string | null
  event_id: string | null
}

type Props = {
  eventIds: string[]
  tableName?: string // default 'hype'
  initial?: Recent[]
}

export default function RecentHype({ eventIds, tableName = 'hype', initial = [] }: Props) {
  const [items, setItems] = useState<Recent[]>(initial)

  useEffect(() => {
    const supabase = createClient()

    // Realtime inserts on the hype table
    const channel = supabase
      .channel('hype-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableName },
        async (payload) => {
          const row = payload.new as any
          // only show hype for events currently listed in the feed
          if (eventIds.length && row.event_id && !eventIds.includes(row.event_id)) return

          // Try to enrich with username (if your row has author_user_id)
          let username: string | null = null
          try {
            if (row.author_user_id) {
              const { data } = await supabase
                .from('profiles')
                .select('username')
                .eq('user_id', row.author_user_id)
                .maybeSingle()
              username = data?.username ?? null
            }
          } catch {}

          setItems((prev) => [
            {
              id: row.id,
              content: row.content ?? 'sent hype 💥',
              created_at: row.created_at ?? new Date().toISOString(),
              username,
              event_id: row.event_id ?? null,
            },
            ...prev,
          ].slice(0, 10))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventIds, tableName])

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <h3 className="text-sm font-semibold text-white/80">Recent hype</h3>
      {!items.length ? (
        <p className="mt-2 text-sm text-white/60">
          No hype yet — be the first to cheer someone on!
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((h) => (
            <li key={h.id} className="text-sm text-white/80">
              <span className="font-medium text-white">
                {h.username ?? 'Someone'}
              </span>{' '}
              {h.content}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}