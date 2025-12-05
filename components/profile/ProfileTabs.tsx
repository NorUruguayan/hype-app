'use client'

import { useState } from 'react'
import type { PostItemClient } from '@/app/me/page'

export default function ProfileTabs({
  initial = 'posts',
  posts = [],
}: {
  initial?: 'posts' | 'daily' | 'about'
  posts?: PostItemClient[] | null
}) {
  const [tab, setTab] = useState(initial)

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        {(['posts', 'daily', 'about'] as const).map((t) => (
          <button
            key={t}
            className={`btn-ghost h-8 px-3 text-[13px] ${
              tab === t ? 'bg-white/10' : ''
            }`}
            onClick={() => setTab(t)}
          >
            {t === 'posts' ? 'Posts' : t === 'daily' ? 'Daily Hype' : 'About'}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {tab === 'posts' &&
          (posts && posts.length > 0 ? (
            <ul className="space-y-3">
              {posts.map((p) => (
                <li key={p.id} className="ui-card p-5">
                  <div className="text-sm opacity-70">
                    {/* Use the pre-formatted, server-provided string */}
                    <time dateTime={p.created_at} suppressHydrationWarning>
                      {p.created_at_display}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{p.content ?? ''}</p>
                  {p.media_url && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.media_url} alt="" className="w-full object-cover" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="ui-card p-5 opacity-80">
              Recent posts will show here.
            </div>
          ))}

        {tab === 'daily' && (
          <div className="ui-card p-5 opacity-80">Daily Hype streak coming soon.</div>
        )}

        {tab === 'about' && (
          <div className="ui-card p-5 opacity-80">About section coming soon.</div>
        )}
      </div>
    </div>
  )
}