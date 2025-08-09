'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TopBarClient({
  isAuthed,
  username,
}: {
  isAuthed: boolean
  username?: string
}) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-2">
      {isAuthed ? (
        <>
          <button
            className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
            onClick={() => router.push(`/@${username}`)}
          >
            Profile
          </button>
          <Link
            href="/logout"
            className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
          >
            Logout
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-indigo-500 text-white px-3 py-1 text-sm"
          >
            Get Started
          </Link>
        </>
      )}
    </div>
  )
}