'use client'

type BannerKey = 'violet' | 'sunset' | 'ocean' | 'emerald' | 'carbon'

const BANNERS: Record<BannerKey, { name: string; classes: string }> = {
  violet: {
    name: 'Violet Mesh',
    classes:
      'from-violet-600/20 via-fuchsia-500/10 to-indigo-500/20 ' +
      'bg-gradient-to-br ' +
      'bg-[radial-gradient(800px_300px_at_0%_0%,rgba(124,58,237,0.25),transparent)] ' +
      'bg-[length:auto] ' +
      'after:absolute after:inset-0 after:opacity-[0.06] after:bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(0deg,#fff_1px,transparent_1px)] after:bg-[size:22px_22px]',
  },
  sunset: {
    name: 'Sunset',
    classes:
      'bg-gradient-to-br from-orange-500/25 via-rose-500/20 to-purple-600/25',
  },
  ocean: {
    name: 'Ocean',
    classes:
      'bg-gradient-to-br from-sky-500/25 via-cyan-500/20 to-blue-700/25',
  },
  emerald: {
    name: 'Emerald',
    classes:
      'bg-gradient-to-br from-emerald-500/25 via-teal-500/20 to-green-700/25',
  },
  carbon: {
    name: 'Carbon',
    classes:
      'bg-[radial-gradient(600px_280px_at_30%_10%,rgba(255,255,255,0.08),transparent)] ' +
      'after:absolute after:inset-0 after:opacity-[0.06] after:bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(0deg,#fff_1px,transparent_1px)] after:bg-[size:22px_22px]',
  },
}

export type BannerPickerProps = {
  value: BannerKey
  onChange: (v: BannerKey) => void
}

export default function BannerPicker({ value, onChange }: BannerPickerProps) {
  return (
    <div>
      <label className="block text-sm text-dim mb-2">Profile banner</label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.keys(BANNERS) as BannerKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={[
              'relative h-16 rounded-xl overflow-hidden border transition',
              value === key ? 'border-white/40 ring-2 ring-white/30' : 'border-white/10 hover:border-white/20',
            ].join(' ')}
            aria-pressed={value === key}
            title={BANNERS[key].name}
          >
            <div className={`absolute inset-0 ${BANNERS[key].classes}`} />
            <span className="absolute bottom-1 left-1 text-[11px] px-2 py-0.5 rounded-md bg-black/40 text-white/90">
              {BANNERS[key].name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}