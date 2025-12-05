// components/Page.tsx
export function PageTitle({
  label, chipClass = 'bg-yellow-400'
}: { label: string; chipClass?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${chipClass}`} />
      <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
    </div>
  )
}

export function PageSection({
  title, children, right
}: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-white/70">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}