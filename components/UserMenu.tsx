// FILE: components/UserMenu.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [display, setDisplay] = useState<string>('You')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Load username/display_name from public.users
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth?.user?.id
      if (!uid) return
      const { data } = await supabase
        .from('users')
        .select('username, display_name')
        .eq('id', uid)
        .maybeSingle()
      if (!mounted) return
      setUsername(data?.username ?? null)
      setDisplay(data?.display_name ?? 'You')
    })()
    return () => {
      mounted = false
    }
  }, [supabase])

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const initial = (display || 'U').charAt(0).toUpperCase()
  const profileHref = username ? `/@${username}` : '/'
  const dailyHref = username ? `/u/${username}/daily` : '/'

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-9 rounded-full brand-gradient text-white font-bold shadow-brand focus:outline-none"
        aria-label="Open user menu"
      >
        {initial}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[color:var(--brand-dark)] p-2 shadow-brand"
        >
          <div className="px-3 py-2 text-sm text-white/80">
            Signed in as <b className="font-semibold">{display}</b>
          </div>
          <div className="my-2 h-px bg-white/10" />

          <Link
            href={profileHref}
            className="block px-3 py-2 rounded-lg hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href={dailyHref}
            className="block px-3 py-2 rounded-lg hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Daily Hype
          </Link>

          <div className="my-2 h-px bg-white/10" />
          <button
            onClick={signOut}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-red-300"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}