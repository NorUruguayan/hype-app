'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Small outside-click hook so the menu closes when clicking elsewhere
function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  return ref
}

export default function UserMenu() {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const boxRef = useOutsideClose<HTMLDivElement>(() => setOpen(false))

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="relative" ref={boxRef}>
      {/* Avatar button (temporary “N” avatar) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 rounded-full brand-gradient text-black font-extrabold grid place-items-center brand-press"
        aria-label="User menu"
      >
        N
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-neutral-900 shadow-lg"
          role="menu"
        >
          <nav className="py-1">
            <Link href="/me" className="block px-3 py-2 hover:bg-white/10 rounded-lg">My page</Link>
            <Link href="/discover" className="block px-3 py-2 hover:bg-white/10 rounded-lg">Discover</Link>
            <Link href="/invite" className="block px-3 py-2 hover:bg-white/10 rounded-lg">Invite friends</Link>
            <Link href="/settings" className="block px-3 py-2 hover:bg-white/10 rounded-lg">Settings</Link>
            <div className="my-1 h-px bg-white/10" />
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg"
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}