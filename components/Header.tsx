// FILE: components/Header.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center text-white font-extrabold">H</div>
      <span className="font-semibold text-white/90">HYPE</span>
    </Link>
  )
}

export default async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Try to get username for profile link
  let username: string | null = null
  if (user?.id) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('user_id', user.id)
      .maybeSingle()
    username = data?.username ?? null
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[color:var(--brand-dark)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Logo />

        {/* center nav */}
        <nav className="hidden gap-6 md:flex">
          <Link href="/" className="text-white/80 hover:text-white transition">Feed</Link>
          <Link href="/discover" className="text-white/80 hover:text-white transition">Discover</Link>
          <Link href="/invite" className="text-white/80 hover:text-white transition">Invite</Link>
        </nav>

        {/* right side auth */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/90 hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full px-3 py-1.5 font-semibold text-white shadow-brand brand-gradient"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative group">
              <button
                className="h-9 w-9 rounded-full brand-gradient text-white font-bold"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                {(username?.[0] ?? 'U').toUpperCase()}
              </button>
              <div className="pointer-events-none absolute right-0 mt-2 w-44 translate-y-1 rounded-xl border border-white/10 bg-[color:var(--brand-dark)] p-1 opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                <Link
                  href={username ? `/@${username}` : '/'}
                  className="block rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                >
                  Profile
                </Link>
                <Link
                  href={username ? `/u/${username}/daily` : '/'}
                  className="block rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                >
                  Daily Hype
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}