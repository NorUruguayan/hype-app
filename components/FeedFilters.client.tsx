'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type KV = Record<string, string | undefined>

// Reusable pill styles
function pill(active: boolean) {
  return [
    'px-3 py-1.5 rounded-full text-sm border transition',
    active
      // ACTIVE: brand pill with **black text**
      ? 'brand-gradient text-black shadow-brand border-transparent'
      // INACTIVE
      : 'border-white/15 hover:bg-white/10 text-white/80',
  ].join(' ')
}

function setParams(params: URLSearchParams, next: KV) {
  const copy = new URLSearchParams(params.toString())
  Object.entries(next).forEach(([k, v]) => {
    if (!v) copy.delete(k)
    else copy.set(k, v)
  })
  return copy
}

export default function FeedFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const current = (k: string) => params.get(k) ?? ''

  const go = useCallback((next: KV) => {
    const q = setParams(params, next)
    router.push(`${pathname}?${q.toString()}`)
  }, [params, pathname, router])

  const cat = current('cat') || 'all'
  const tf = current('tf') || 'today'
  const vis = current('vis') || 'all'
  const sort = current('sort') || 'new'

  return (
    <div className="space-y-3">
      {/* Category */}
      <div className="flex flex-wrap gap-2">
        {[
          ['all','All'],
          ['personal','Personal'],
          ['sports','Sports'],
          ['school','School'],
          ['career','Career'],
        ].map(([key,label]) => (
          <button key={key} className={pill(cat===key)} onClick={()=>go({cat:key})}>
            {label}
          </button>
        ))}
      </div>

      {/* Timeframe */}
      <div className="flex flex-wrap gap-2">
        {[
          ['today','Today'],
          ['week','This Week'],
          ['upcoming','Upcoming'],
        ].map(([key,label]) => (
          <button key={key} className={pill(tf===key)} onClick={()=>go({tf:key})}>
            {label}
          </button>
        ))}
      </div>

      {/* Visibility */}
      <div className="flex flex-wrap gap-2">
        {[
          ['all','All'],
          ['public','Public'],
          ['followers','Followers'],
          ['mine','Mine'],
        ].map(([key,label]) => (
          <button key={key} className={pill(vis===key)} onClick={()=>go({vis:key})}>
            {label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex flex-wrap gap-2">
        {[
          ['new','Newest'],
          ['ending','Ending Soon'],
        ].map(([key,label]) => (
          <button key={key} className={pill(sort===key)} onClick={()=>go({sort:key})}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}