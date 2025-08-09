// FILE: app/u/[username]/daily/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DailyEventsLive from '@/components/DailyEventsLive'
import NewDailyHypeButton from '@/components/NewDailyHypeButton'

export default async function DailyPage({
  params,
}: {
  params: Promise<{ username?: string }>
}) {
  const { username } = await params
  const handle = username?.replace('@', '') || null
  if (!handle) notFound()

  const supabase = await createClient()

  // Owner profile
  const { data: owner } = await supabase
    .from('users')
    .select('id, username, display_name')
    .eq('username', handle)
    .maybeSingle()
  if (!owner) notFound()

  // Viewer (to decide isOwn)
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser()
  const isOwn = viewer?.id === owner.id

  // Initial events (include visibility)
  const { data: events } = await supabase
    .from('daily_events')
    .select('id, title, type, event_at, visibility, created_at')
    .eq('user_id', owner.id)
    .order('event_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {owner.display_name || owner.username} — Daily Hype
          </h1>
          {isOwn && <NewDailyHypeButton userId={owner.id} />}
        </div>

        <div className="mt-6">
          <DailyEventsLive
            initialEvents={events ?? []}
            username={owner.username}
            isOwn={isOwn}
          />
        </div>
      </div>
    </div>
  )
}