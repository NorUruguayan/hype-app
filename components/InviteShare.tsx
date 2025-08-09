'use client'

export default function InviteShare({ username }: { username: string }) {
  const url =
    (process.env.NEXT_PUBLIC_SITE_URL ?? '') + `/@${username}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      alert('Profile link copied! Share it to get hyped.')
    } catch {
      alert('Profile link: ' + url)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={copy}
        className="rounded-full px-4 py-2 border border-white/20 bg-white/5 hover:bg-white/10"
      >
        Invite friends
      </button>

      <a
        href="/demo"
        className="rounded-full px-4 py-2 brand-gradient text-white shadow-brand"
      >
        Discover people
      </a>
    </div>
  )
}