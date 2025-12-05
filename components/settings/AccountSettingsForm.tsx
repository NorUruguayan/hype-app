// components/settings/AccountSettingsForm.tsx
'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initial: {
    email: string
    display_name: string
    username: string
    bio: string
  }
}

export default function AccountSettingsForm({ initial }: Props) {
  const supabase = createClient()
  const [pending, startTransition] = useTransition()

  const [email, setEmail] = useState(initial.email)
  const [displayName, setDisplayName] = useState(initial.display_name)
  const [username, setUsername] = useState(initial.username)
  const [bio, setBio] = useState(initial.bio)
  const [password, setPassword] = useState('')

  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // Availability state
  type A = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const [avail, setAvail] = useState<A>('idle')
  const normalized = useMemo(() => username.trim().toLowerCase(), [username])

  function toast(ok: boolean, text: string) {
    setErr(ok ? null : text); setMsg(ok ? text : null)
    setTimeout(() => { setMsg(null); setErr(null) }, 3000)
  }

  useEffect(() => {
    let alive = true
    const re = /^[a-z0-9_]{3,20}$/i
    async function run() {
      if (!re.test(normalized)) { setAvail('invalid'); return }
      setAvail('checking')
      const { data: me } = await supabase.auth.getUser()
      const uid = me.user?.id
      const { count, error } = await supabase
        .from('profiles')
        .select('user_id', { count: 'exact', head: true })
        .eq('username', normalized)
        .neq('user_id', uid ?? '')
      if (!alive) return
      if (error) { setAvail('idle'); return }
      setAvail((count ?? 0) === 0 ? 'available' : 'taken')
    }
    const t = setTimeout(run, 400)
    return () => { alive = false; clearTimeout(t) }
  }, [normalized, supabase])

  async function saveProfile() {
    setMsg(null); setErr(null)
    if (avail === 'invalid') return toast(false, 'Username must be 3–20 letters/numbers/underscores.')
    if (avail === 'taken') return toast(false, 'That username is already taken.')

    startTransition(async () => {
      const { data: me } = await supabase.auth.getUser()
      const uid = me.user?.id
      if (!uid) return toast(false, 'Not signed in.')

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: normalized,
          bio: bio.trim(),
        })
        .eq('user_id', uid)

      if (error) toast(false, error.message)
      else toast(true, 'Profile saved.')
    })
  }

  async function saveEmail() {
    setMsg(null); setErr(null)
    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ email: email.trim() })
      if (error) toast(false, error.message)
      else toast(true, 'Email updated. Check your inbox to verify.')
    })
  }

  async function savePassword() {
    setMsg(null); setErr(null)
    if (password.length < 8) return toast(false, 'Password must be at least 8 characters.')
    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) toast(false, error.message)
      else { setPassword(''); toast(true, 'Password updated.') }
    })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void saveProfile() }} className="space-y-6">
      {msg && <div className="rounded-md bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm">{msg}</div>}
      {err && <div className="rounded-md bg-red-500/10 text-red-300 px-3 py-2 text-sm">{err}</div>}

      <div className="space-y-1">
        <label className="text-sm font-medium">Display name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7c4dff]/60"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Username</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 pr-24 outline-none focus:ring-2 focus:ring-[#7c4dff]/60"
            placeholder="username"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
            {avail === 'checking' && <span className="text-muted-foreground">checking…</span>}
            {avail === 'available' && <span className="text-emerald-400">✓ available</span>}
            {avail === 'taken' && <span className="text-red-400">✖ taken</span>}
            {avail === 'invalid' && <span className="text-orange-400">invalid</span>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">3–20 chars, letters/numbers/underscore.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7c4dff]/60"
          placeholder="Tell people what you’re hyped about…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-pill bg-[linear-gradient(135deg,#7c4dff_0%,#6a00ff_50%,#5b00ea_100%)] text-white font-semibold shadow-cta hover:opacity-95 disabled:opacity-50 lightning-cursor"
        >
          {pending ? 'Saving…' : 'Save profile'}
        </button>
      </div>

      <div className="h-px bg-white/10" />

      <div className="space-y-3">
        <h3 className="font-medium">Email</h3>
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7c4dff]/60"
            placeholder="you@example.com"
          />
          <button
            type="button"
            onClick={saveEmail}
            disabled={pending}
            className="px-4 py-2 rounded-pill bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 lightning-cursor"
          >
            Update email
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Updating email may require clicking a verification link.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Password</h3>
        <div className="flex gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7c4dff]/60"
            placeholder="New password"
          />
          <button
            type="button"
            onClick={savePassword}
            disabled={pending}
            className="px-4 py-2 rounded-pill bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 lightning-cursor"
          >
            Update password
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
      </div>
    </form>
  )
}