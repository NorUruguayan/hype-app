// FILE: components/HypeCollection.tsx
import { format } from 'date-fns'
import { Tables } from '@/lib/supabase/types'

type Props = {
  hypes: Tables<'hypes'>[]
}

export default function HypeCollection({ hypes }: Props) {
  return (
    <div className="space-y-4">
      {/* Header with multiple lightning bolts */}
      <h2 className="text-lg font-bold flex items-center gap-2 text-white">
        ⚡⚡⚡ Hype Collection
      </h2>

      {hypes.length === 0 ? (
        <p className="text-white/60 text-sm">No hypes yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {hypes.map((hype) => (
            <div
              key={hype.id}
              className="rounded-xl border border-white/10 bg-white/[0.05] p-4"
            >
              <p className="text-white">{`“${hype.content}”`}</p>
              <div className="text-sm text-white/50 mt-1">
                — {hype.from_display_name || 'Someone'} •{' '}
                {format(new Date(hype.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}