// FILE: lib/site.ts
import { headers } from 'next/headers'

/** Best-effort absolute site URL (works in prod & dev). */
export function getSiteUrl() {
  // Prefer explicit env (set this in production!)
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env && /^https?:\/\//i.test(env)) return env.replace(/\/+$/, '')

  // Fall back to request headers (Vercel, proxies) or localhost
  const h = headers()
  const proto = (h.get('x-forwarded-proto') || 'http').split(',')[0].trim()
  const host = (h.get('x-forwarded-host') || h.get('host') || 'localhost:3000')
    .split(',')[0]
    .trim()

  return `${proto}://${host}`.replace(/\/+$/, '')
}