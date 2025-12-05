// FILE: lib/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Next.js 15: cookies() is async, so await it.
 */
export async function getServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // If you later need auth writes on the server, implement set/remove.
      },
    }
  )
}

/**
 * Convenience: get the current authenticated user on the server.
 * Lets pages keep importing { getServerUser } as they did before.
 */
export async function getServerUser() {
  const supabase = await getServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}