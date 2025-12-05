// components/discover/DiscoverPanel.tsx
'use client'

import { useMemo, useState } from 'react'

export type Person = {
  id: string
  name: string
  handle: string
  tag?: 'all' | 'following' | 'nearby' | 'trending'
}

export default function DiscoverPanel({ people }: { people: Person[] }) {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'all' | 'following' | 'nearby' | 'trending'>('all')

  const rows = useMemo(() => {
    let list = people
    if (tab !== 'all') list = list.filter(p => (p.tag ?? 'all') === tab)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter(
        p => p.name.toLowerCase().includes(s) || p.handle.toLowerCase().includes(s)
      )
    }
    return list
  }, [people, q, tab])

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'following', 'nearby', 'trending'] as const).map(k => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition
              ${tab === k ? 'brand-gradient text-black border-transparent' : 'border-white/10 hover:bg-white/5'}`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people…"
          className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/20"
        />
        <button
          onClick={() => setQ(q)}
          className="rounded-xl border border-white/10 px-4 text-sm hover:bg-white/5"
        >
          Search
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-white/10 p-4 hover:border-yellow-400/40 transition"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-2 ring-yellow-400/40">
                HYPE
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{p.name}</div>
                <div className="truncate text-sm text-white/60">{p.handle}</div>
              </div>
            </div>

            <a
              href="#"
              className="brand-press brand-gradient hidden rounded-full px-3 py-1.5 text-sm font-medium text-black sm:inline-flex"
            >
              + Hype
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}