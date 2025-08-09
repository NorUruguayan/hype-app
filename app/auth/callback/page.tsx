'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ensureProfile } from '@/lib/supabase/ensureProfile'

export default function AuthCallbackPage() {
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    const go = async () => {
      const supabase = await createClient()

      const code = search.get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      // Safety: ensure a profile row exists
      await ensureProfile(supabase, session.user)

      // If username looks guessed/missing, onboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const emailHandle = (session.user.email?.split('@')[0] ?? '').toLowerCase().replace(/[^a-z0-9_]/g,'')
      const guessed = !profile?.username || profile.username === 'user' || profile.username === emailHandle

      if (guessed) {
        router.replace('/onboarding')
        return
      }

      const handle = profile!.username
      const next = search.get('next')
      router.replace(next && next.startsWith('/') ? next : `/@${handle}`)
    }

    go()
  }, [router, search])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--brand-dark)]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-white shadow-brand">
        Signing you in…
      </div>
    </div>
  )
}