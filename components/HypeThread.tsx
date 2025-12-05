'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import HypeCard, { type Hype } from '@/components/HypeCard'

type Props = {
  eventId: string
  initial: Hype[]
}

/**
 * Realtime hype thread for a given event.
 * - Renders initial server-fetched hype
 * - Subscribes to INSERTs on public.hype filtered by daily_event_id
 * - On each insert, fetches the joined author profile and prepends the new hype
 */
export default function HypeThread({ eventId, initial }: Props) {
  const [items, setItems] = useState<Hype[]>(initial)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new hype rows for this event
    const channel = supabase
      .channel(`hype-inserts-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hype',
          filter: `daily_event_id=eq.${eventId}`,
        },
        async (payload) => {
          try {
            const id = (payload.new as any)?.id as string | undefined
            if (!id) return

            // Fetch the row with the joined author profile to render properly
            const { data, error } = await supabase
              .from('hype')
              .select(`
                id, content, created_at,
                profiles ( username, display_name, avatar_url )
              `)
              .eq('id', id)
              .maybeSingle()

            if (error || !data) return

            const author = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
            const next: Hype = {
              id: data.id,
              content: data.content,
              created_at: data.created_at,
              author: {
                username: author?.username ?? null,
                display_name: author?.display_name ?? null,
                avatar_url: author?.avatar_url ?? null,
              },
            }

            // Prepend newest hype
            setItems((prev) => [next, ...prev])
          } catch {
            // ignore errors for realtime fetches
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  if (!items.length) {
    return (
      <div className="card p-8 text-center text-soft">
        No hype yet — be the first to cheer them on!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((h) => (
        <HypeCard key={h.id} hype={h} />
      ))}
    </div>
  )
}