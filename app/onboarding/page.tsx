'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    (async () => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login?next=/onboarding'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', user.id)
        .maybeSingle()

      const emailHandle = (user.email?.split('@')[0] ?? '').toLowerCase().replace(/[^a-z0-9_]/g,'')
      const guessed = !profile?.username || profile.username === 'user' || profile.username === emailHandle

      if (!guessed) {
        router.replace(`/@${profile!.username}`)
        return
      }

      setUsername(profile?.username || emailHandle)
      setDisplayName(profile?.display_name || (user.user_metadata?.display_name ?? ''))
      setLoading(false)
    })()
  }, [router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true); setError(null)

    try {
      const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
      if (clean.length < 3) throw new Error('Handle must be at least 3 characters.')

      const supabase = await createClient()

      // Check availability (someone else?)
      const { data: taken } = await supabase
        .from('profiles').select('user_id').eq('username', clean).not('user_id','eq',userId).maybeSingle()
      if (taken) throw new Error('That handle is taken.')

      // Upsert (RLS: auth.uid() = user_id)
      const { error: upErr } = await supabase.from('profiles').upsert(
        { user_id: userId, username: clean, display_name: displayName || clean },
        { onConflict: 'user_id' }
      )
      if (upErr) throw upErr

      router.replace(`/@${clean}`)
    } catch (err: any) {
      setError(err.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-[color:var(--brand-dark)] text-white">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-7 shadow-brand backdrop-blur text-white">
          <h1 className="text-2xl font-extrabold mb-2">Pick your handle</h1>
          <p className="text-white/70 mb-6">Choose how your profile URL appears.</p>

          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Handle</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}
                pattern="[a-z0-9_]{3,30}"
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 outline-none"
                placeholder="yourname"
                required
              />
              <p className="text-xs text-white/50 mt-1">Your URL: hype.app/@{username || 'yourname'}</p>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Display name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 outline-none"
                placeholder="Your Name"
              />
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full py-3 font-semibold text-white brand-gradient shadow-brand disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}