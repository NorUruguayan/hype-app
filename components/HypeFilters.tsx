'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function HypeFilters({
  activeView,
  activeRange,
}: {
  activeView: 'all' | 'mine' | 'following'
  activeRange: 'today' | 'week' | 'month'
}) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const set = (k: 'view' | 'range', v: string) => {
    const params = new URLSearchParams(sp.toString())
    params.set(k, v)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const Chip = ({
    label,
    onClick,
    active,
  }: { label: string; onClick: () => void; active: boolean }) => (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm border ${
        active
          ? 'brand-gradient text-white shadow-brand border-transparent'
          : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Chip label="All" active={activeView === 'all'} onClick={() => set('view', 'all')} />
        <Chip label="Mine" active={activeView === 'mine'} onClick={() => set('view', 'mine')} />
        <Chip label="Following" active={activeView === 'following'} onClick={() => set('view', 'following')} />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Chip label="Today" active={activeRange === 'today'} onClick={() => set('range', 'today')} />
        <Chip label="This week" active={activeRange === 'week'} onClick={() => set('range', 'week')} />
        <Chip label="This month" active={activeRange === 'month'} onClick={() => set('range', 'month')} />
      </div>
    </div>
  )
}