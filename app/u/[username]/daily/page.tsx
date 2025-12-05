// app/u/[username]/daily/page.tsx
import ProfileHeaderGlobal from '@/components/ProfileHeaderGlobal'

interface Props {
  params: { username: string }
}

export default async function UserDailyPage({ params }: Props) {
  const { username } = params

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <ProfileHeaderGlobal />

      {/* ===== Daily hype content for this user ===== */}
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">{username}&apos;s Daily Hype</h1>
        <p className="text-sm text-muted-foreground">
          Create and view daily hype entries.
        </p>

        {/* Replace with your actual daily composer / list */}
        <div className="rounded-xl border border-white/10 p-6">
          <p className="text-sm text-muted-foreground">TODO: daily composer and entries list.</p>
        </div>
      </section>
    </div>
  )
}