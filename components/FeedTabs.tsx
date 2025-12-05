'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

const TABS = [
  { key: 'following', label: 'Following' },
  { key: 'public', label: 'Public' },
  { key: 'all', label: 'All' },
]

export default function FeedTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = (searchParams.get('tab') ?? 'public') as 'following' | 'public' | 'all'

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] p-1 w-fit">
      {TABS.map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-full transition',
            active === t.key
              // ACTIVE: brand pill with black text for better contrast
              ? 'brand-gradient text-black shadow-brand'
              // INACTIVE: subtle text, hover brighten
              : 'text-white/80 hover:text-white hover:bg-white/10'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}