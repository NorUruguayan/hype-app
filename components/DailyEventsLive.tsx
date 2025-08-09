'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NewDailyHypeButton from '@/components/NewDailyHypeButton'

type EventRow = {
  id: string
  user_id: string
  title: string
  type: 'career'|'school'|'sports'|'personal'
  event_at: string | null
  visibility: 'public'|'followers'|'following'|'private'
  created_at: string
}

export default function DailyEventsLive({
  initialEvents,
  username,
  isOwn,
  userId, // pass owner id when rendering if you can, otherwise omit button
}: {
  initialEvents: EventRow[]
  username: string
  isOwn: boolean
  userId?: string
}) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents || [])

  // (Optional) subscribe to changes later…

  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/80">
        <div className="font-semibold mb-2">No daily hypes yet</div>
        <p className="text-white/60 mb-4">
          Add one—job interview, test, game day, first day, anything you want encouragement for.
        </p>
        {isOwn && userId && <NewDailyHypeButton userId={userId} />}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map(ev => (
        <div key={ev.id} className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{ev.title}</div>
            <div className="text-xs px-2 py-1 rounded-full bg-white/[0.08] border border-white/10">
              {ev.visibility === 'public' ? 'Public' :
               ev.visibility === 'followers' ? 'Hypers' :
               ev.visibility === 'following' ? 'Hypees' : 'Private'}
            </div>
          </div>
          {ev.event_at && (
            <div className="text-white/60 text-sm mt-1">
              {new Date(ev.event_at).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}