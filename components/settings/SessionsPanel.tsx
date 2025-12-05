// components/settings/SessionsPanel.tsx
'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionsPanel() {
  const supabase = createClient()
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  function toast(ok: boolean, text: string) {
    setErr(ok ? null : text)
    setMsg(ok ? text : null)
    setTimeout(() => {
      setMsg(null)
      setErr(null)
    }, 3000)
  }

  async function signOutOthers() {
    setMsg(null); setErr(null)
    startTransition(async () => {
      const res = await fetch('/api/auth/signout-others', { method: 'POST' })
      const json = await res.json()
      if (!json.ok) toast(false, json.error ?? 'Failed to sign out other sessions')
      else toast(true, 'Signed out other sessions. This device stays signed in.')
    })
  }

  async function signOutEverywhere() {
    await signOutOthers()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="rounded-xl border border-white/10 p-6">
      <h2 className="text-lg font-medium mb-4">Sessions & devices</h2>

      {msg && <div className="rounded-md bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm mb-3">{msg}</div>}
      {err && <div className="rounded-md bg-red-500/10 text-red-300 px-3 py-2 text-sm mb-3">{err}</div>}

      <p className="text-sm text-muted-foreground mb-4">
        Revoke all other devices signed in to your account. This device stays signed in.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={signOutOthers}
          disabled={pending}
          className="px-4 py-2 rounded-pill bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 lightning-cursor"
        >
          {pending ? 'Working…' : 'Sign out other sessions'}
        </button>

        <button
          onClick={signOutEverywhere}
          disabled={pending}
          className="px-4 py-2 rounded-pill bg-[linear-gradient(135deg,#7c4dff_0%,#6a00ff_50%,#5b00ea_100%)] text-white font-semibold shadow-cta hover:opacity-95 disabled:opacity-50 lightning-cursor"
        >
          {pending ? 'Working…' : 'Sign out ALL sessions'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Requires server service‑role key. Your current session will remain until you sign out here.
      </p>
    </div>
  )
}