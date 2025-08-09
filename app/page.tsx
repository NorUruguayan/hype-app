// FILE: app/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Countdown from '@/components/Countdown'
import DailyHypeComposer from '@/components/DailyHypeComposer'
import VisibilityChip from '@/components/VisibilityChip'

export default async function Home() {
  const supabase = await createClient()

  const { data: me } = await supabase.auth.getUser()

  const nowISO = new Date().toISOString()
  const in2wISO = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

  // Let RLS decide visibility (followers/hypees/public/private)
  const { data: events, error } = await supabase
    .from('daily_events')
    .select(`
      id, title, type, event_at, visibility,
      user:users ( id, username, display_name )
    `)
    .not('event_at', 'is', null)
    .gte('event_at', nowISO)
    .lte('event_at', in2wISO)
    .order('event_at', { ascending: true })
    .limit(50)

  if (error) console.warn('feed error:', error.message)

  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">⚡ Daily Hype Feed</h1>
          <div className="flex gap-2">
            {me?.user ? (
              <Link
                href={`/u/${encodeURIComponent(me.user.user_metadata?.username ?? '')}/daily`}
                className="brand-gradient text-white px-4 py-2 rounded-full font-semibold shadow-brand hover:opacity-90"
              >
                + New Daily Hype
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="brand-gradient text-white px-4 py-2 rounded-full font-semibold shadow-brand hover:opacity-90"
                >
                  Create Yours
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </header>

        {!events?.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center text-white/70">
            No upcoming Daily Hype events.{' '}
            <Link href="/landing" className="underline">Learn more</Link> or{' '}
            {me?.user ? (
              <Link
                href={`/u/${encodeURIComponent(me.user.user_metadata?.username ?? '')}/daily`}
                className="underline"
              >
                create one
              </Link>
            ) : (
              <Link href="/signup" className="underline">create one</Link>
            )}
            .
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((e: any) => {
              const u = e.user
              const handle = u?.username ?? 'user'
              const isPast = e.event_at ? Date.parse(e.event_at) < Date.now() : false
              return (
                <section key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm uppercase text-white/60">{e.type}</div>
                      <h2 className="text-xl font-semibold flex items-center gap-2 flex-wrap">
                        <Link href={`/u/${handle}/daily`} className="hover:underline">
                          {e.title}
                        </Link>
                        {!isPast ? (
                          <Countdown to={e.event_at} />
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                            Thank you for the hypes — I’m READY! 💪⚡
                          </span>
                        )}
                        <VisibilityChip visibility={e.visibility ?? null} />
                      </h2>
                      <div className="text-white/70 text-sm truncate">
                        by{' '}
                        <Link href={`/@${handle}`} className="hover:underline">
                          {u?.display_name || handle}
                        </Link>{' '}
                        • @{handle}
                      </div>
                    </div>

                    <Link href={`/@${handle}`} className="shrink-0">
                      <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white font-bold">
                        {(u?.display_name?.[0] || handle?.[0] || 'H').toUpperCase()}
                      </div>
                    </Link>
                  </div>

                  {!isPast && (
                    <div className="mt-4">
                      <DailyHypeComposer eventId={e.id} username={handle} />
                    </div>
                  )}

                  <div className="mt-3 text-sm text-white/60">
                    <Link href={`/u/${handle}/daily`} className="hover:underline">
                      View hype for this event
                    </Link>
                    {' · '}
                    <Link href={`/@${handle}`} className="hover:underline">
                      Visit profile
                    </Link>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}