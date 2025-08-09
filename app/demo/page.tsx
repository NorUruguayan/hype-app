// FILE: app/demo/page.tsx
import Link from 'next/link'
import Countdown from '@/components/Countdown'
import ScrollToDailyOnLoad from '@/components/DemoHelpers'
import DemoHypeComposer from '@/components/DemoHypeComposer'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'HYPE — Demo',
  description: 'See how HYPE looks without creating an account.',
}

/* ---------- helpers (server-safe) ---------- */
function pick<T>(arr: T[], n: number) {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < Math.min(n, arr.length)) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}
function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 60 * 60 * 1000)
}

export default async function DemoPage() {
  // Random name + bio
  const names = ['Jordan Lee', 'Avery Kim', 'Taylor Morgan', 'Riley Chen', 'Casey Brooks']
  const bios = [
    'Product designer. Distance runner. Perpetual optimist.',
    'Engineer who ships. Coffee and cameras.',
    'Community builder. Good vibes only.',
    'Marketer by day, DJ by night.',
    'Founder. Storyteller. Lifelong learner.',
  ]
  const display_name = pick(names, 1)[0]
  const username = display_name.split(' ')[0].toLowerCase()
  const bio = pick(bios, 1)[0]

  // Random long‑term hypes
  const lines = [
    'Brings clarity to chaos — dependable and thoughtful.',
    'Relentlessly positive and insanely organized — total force multiplier.',
    'Cares about craft and people. Ships great work every time.',
    'Turns vague ideas into crisp plans. Calm under pressure.',
    'Heart of the team. Makes everyone around them better.',
  ]
  const who = ['Sam', 'Ari', 'Devon', 'Quinn', 'Noah', 'Jess']
  const hypeCount = 3 + Math.floor(Math.random() * 3) // 3–5
  const hypes = Array.from({ length: hypeCount }).map((_, i) => ({
    id: String(i + 1),
    content: pick(lines, 1)[0],
    created_at: daysAgo(4 + i * 7).toISOString(),
    from_display_name: pick(who, 1)[0],
  }))

  // Two daily events: one future, one past (randomized timing)
  const daily = [
    {
      id: 'e1',
      title: pick(['Portfolio presentation', 'Final‑round interview', 'Team kickoff'], 1)[0],
      type: 'career',
      event_at: hoursFromNow(3 + Math.floor(Math.random() * 8)).toISOString(),
      messages: [
        { id: 'm1', content: 'You’re absolutely ready. Go shine! ✨', created_at: new Date().toISOString() },
        { id: 'm2', content: 'Proud of you. Deep breaths, clear story. 🙌', created_at: new Date().toISOString() },
      ],
    },
    {
      id: 'e2',
      title: pick(['Half‑marathon', 'First day of school', 'Conference talk'], 1)[0],
      type: 'personal',
      event_at: hoursFromNow(-6 - Math.floor(Math.random() * 24)).toISOString(),
      messages: [
        { id: 'm3', content: 'Crushed it! 🏁🔥', created_at: daysAgo(0).toISOString() },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      {/* smooth scroll to #daily if present */}
      <ScrollToDailyOnLoad />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Demo note + Back to Home */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80">
            <b>Demo mode:</b> This page is a static preview — no signup required.
            Data below is mocked to show how HYPE looks and feels.
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 whitespace-nowrap"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 md:p-8 shadow-brand">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold">
              {display_name[0]}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {display_name}
              </h1>
              <p className="text-white/70">@{username}</p>
              <p className="text-white/80 mt-3 leading-relaxed">{bio}</p>
            </div>
            <div className="justify-self-end text-right">
              <div className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/10">
                <div className="text-xl md:text-2xl font-extrabold leading-none">
                  {hypes.length}
                </div>
                <div className="text-xs tracking-wide text-white/60">Hypes</div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/signup"
              className="brand-gradient btn-pulse text-white px-5 py-2.5 rounded-full font-semibold shadow-brand hover:opacity-90"
            >
              Get Your HYPE Page
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/demo#daily"
              className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Jump to Daily Hype
            </Link>
          </div>
        </div>

        {/* Long‑term hypes */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4">⚡⚡⚡ Hype Collection</h2>
          <div className="space-y-4">
            {hypes.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"
              >
                <p className="text-white">“{h.content}”</p>
                <div className="text-sm text-white/60 mt-2">
                  — {h.from_display_name} ·{' '}
                  {new Date(h.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Daily hype preview */}
        <section id="daily" className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white/90">Daily Hype</h2>
            <Link
              href="/signup"
              className="brand-gradient btn-pulse text-white px-4 py-2 rounded-full font-semibold shadow-brand hover:opacity-90"
            >
              Create Your Own
            </Link>
          </div>

          <div className="space-y-6">
            {daily.map((e) => {
              const isPast = Date.parse(e.event_at) < Date.now()
              return (
                <div
                  key={e.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-6"
                >
                  <div className="text-sm uppercase text-white/60">{e.type}</div>
                  <h3 className="text-xl font-semibold flex items-center">
                    {e.title}
                    {!isPast ? (
                      <Countdown to={e.event_at} />
                    ) : (
                      <span className="ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                        Thank you for the hypes — I’m READY! 💪⚡
                      </span>
                    )}
                  </h3>
                  <div className="text-white/60 text-sm">
                    {new Date(e.event_at).toLocaleString()}
                  </div>

                  {/* Client-only fake composer + list (no backend) */}
                  <DemoHypeComposer initial={e.messages} />
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}