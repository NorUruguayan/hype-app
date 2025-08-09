// FILE: components/HypeCard.tsx
type Hype = {
  id?: string
  content: string
  created_at?: string | null
  from_username?: string | null
  from_display_name?: string | null
  from_user_id?: string | null
}

function formatDate(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  // e.g., "Aug 08, 2025"
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export default function HypeCard({ hype }: { hype: Hype }) {
  const who = hype.from_display_name || hype.from_username || 'Someone'

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <p className="text-lg leading-relaxed mb-3">“{hype.content}”</p>
      <div className="flex items-center text-sm text-white/65">
        <span>— {who}</span>
        {hype.created_at && (
          <>
            <span aria-hidden className="mx-2 select-none">·</span>
            <time dateTime={hype.created_at}>{formatDate(hype.created_at)}</time>
          </>
        )}
      </div>
    </article>
  )
}