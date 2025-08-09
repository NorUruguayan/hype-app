// FILE: components/VisibilityChip.tsx
export default function VisibilityChip({
  visibility,
}: {
  visibility?: 'public' | 'followers' | 'hypees' | 'all' | 'private' | null
}) {
  if (!visibility) return null
  const label =
    visibility === 'public'
      ? 'Public'
      : visibility === 'followers'
      ? 'Hypers'
      : visibility === 'hypees'
      ? 'Hypees'
      : visibility === 'all'
      ? 'Hypers or Hypees'
      : 'Private'
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
      {label}
    </span>
  )
}