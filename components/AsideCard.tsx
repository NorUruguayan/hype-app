import type { HTMLAttributes } from 'react'

export default function AsideCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <aside className="sticky top-6">
      <div className={`card ${className}`} {...props} />
    </aside>
  )
}