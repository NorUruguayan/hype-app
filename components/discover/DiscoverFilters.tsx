// components/discover/DiscoverFilters.tsx
'use client'

import { useMemo, useState } from 'react'

export type Person = {
  id: string
  name: string
  handle: string
  tag?: 'all' | 'following' | 'nearby' | 'trending'
}

type Props = {
  people: Person[]
  onRender: (rows: Person[]) => React.ReactNode
}

export default function DiscoverFilters({ people, onRender }: Props) {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'all' | 'following' | 'nearby' | 'trending'>('all')

  const filtered = useMemo(() => {
    let rows = people
    if (tab !== 'all') rows = rows.filter(p => (p.tag ?? 'all') === tab)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      rows = rows.filter(p => p.name.toLowerCase().includes(s) || p.handle.toLowerCase().includes(s))
    }
    return rows
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
          onClick={() => setQ(q)} // no-op (keeps parity with a search button)
          className="rounded-xl border border-white/10 px-4 text-sm hover:bg-white/5"
        >
          Search
        </button>
      </div>

      {/* Grid render */}
      {onRender(filtered)}
    </div>
  )
}