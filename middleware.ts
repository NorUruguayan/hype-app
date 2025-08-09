// FILE: middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// routes that should NEVER be treated as usernames
const RESERVED = new Set([
  'login',
  'signup',
  'demo',
  'landing',
  'u',
  'auth',
  'api',
  'daily',
  // add more as you add pages:
  'onboarding',
  'discover',
  'invite',
  'settings',
])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) /@username  →  /u/username  (accept mixed case, normalize to lower)
  const at = pathname.match(/^\/@([a-z0-9_]{3,30})$/i)
  if (at) {
    const handle = at[1].toLowerCase()
    const url = req.nextUrl.clone()
    url.pathname = `/u/${handle}`
    return NextResponse.rewrite(url)
  }

  // 2) bare /username → /u/username (skip reserved; accept mixed case)
  const bare = pathname.match(/^\/([a-z0-9_]{3,30})$/i)
  if (bare) {
    const handle = bare[1].toLowerCase()
    if (!RESERVED.has(handle)) {
      const url = req.nextUrl.clone()
      url.pathname = `/u/${handle}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

// Don’t run on Next assets, API routes, or auth paths, or files with extensions
export const config = {
  matcher: ['/((?!_next|api|auth|.*\\..*).*)'],
}