// app/discover/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const supabase = await createClient()

  // Find public daily events in the next ~72h
  const now = new Date()
  const in3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: events } = await supabase
    .from('daily_events')
    .select('id, user_id, title, starts_at, visibility, story')
    .eq('visibility', 'public')
    .gte('starts_at', now.toISOString())
    .lte('starts_at', in3d)
    .order('starts_at', { ascending: true })

  // Pull profiles for those owners
  const ownerIds = Array.from(new Set((events ?? []).map(e => e.user_id)))
  let profilesById = new Map<string, { username: string, display_name: string }>()
  if (ownerIds.length) {
    const { data: owners } = await supabase
      .from('profiles')
      .select('user_id, username, display_name')
      .in('user_id', ownerIds)
    (owners ?? []).forEach(o => profilesById.set(o.user_id, { username: o.username, display_name: o.display_name }))
  }

  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      <div className="max-w-3xl mx-auto px-4 py-10 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Discover Hype Requests</h1>
          <Link
            href="/"
            className="rounded-full px-4 py-2 border border-white/20 bg-white/5 hover:bg-white/10"
          >
            Back to Feed
          </Link>
        </div>

        {!events?.length ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <p className="text-white/80">No public requests in the next few days. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {events!.map(ev => {
              const owner = profilesById.get(ev.user_id)
              const handle = owner?.username ?? 'someone'
              const display = owner?.display_name || handle
              const eventLink = `/u/${handle}/daily` // or a dedicated /event/[id] page later

              return (
                <article key={ev.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                  <div className="text-xs tracking-wide text-white/60 mb-1">PUBLIC</div>
                  <h2 className="text-xl font-bold">{ev.title}</h2>
                  <p className="text-white/70 mb-2">by <Link href={`/@${handle}`} className="hover:underline">@{handle}</Link></p>
                  {ev.story && <p className="text-white/80 mb-3">{ev.story}</p>}
                  <p className="text-white/60 text-sm mb-4">
                    Starts: {new Date(ev.starts_at).toLocaleString()}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={eventLink}
                      className="brand-gradient text-white px-4 py-2 rounded-full font-semibold shadow-brand hover:opacity-90"
                    >
                      Send Hype ⚡
                    </Link>
                    <button
                      className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={async () => {
                        const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${eventLink}`
                        if (navigator.share) {
                          try { await navigator.share({ title: ev.title, url }) } catch {}
                        } else {
                          await navigator.clipboard.writeText(url)
                          alert('Share link copied.')
                        }
                      }}
                    >
                      Share
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}