'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPanel() {
  const supabase = createClient()
  const [confirm, setConfirm] = useState('')
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function handleDelete() {
    setMsg(null); setErr(null)
    if (confirm !== 'DELETE') {
      setErr('Type DELETE (all caps) to confirm.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/account/delete', { method: 'POST' })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error || 'Failed to delete account')

        // local sign-out + redirect to goodbye
        await supabase.auth.signOut()
        window.location.href = '/signup'
      } catch (e: any) {
        setErr(e?.message ?? 'Something went wrong')
      }
    })
  }

  return (
    <div className="rounded-xl border border-white/10 p-6">
      <h2 className="text-lg font-medium mb-2 text-red-300">Danger zone</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Deleting your account removes your profile, followers/following relationships, and media.
        This cannot be undone.
      </p>

      {msg && <div className="rounded-md bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm mb-3">{msg}</div>}
      {err && <div className="rounded-md bg-red-500/10 text-red-300 px-3 py-2 text-sm mb-3">{err}</div>}

      <div className="flex items-center gap-3 mb-3">
        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder='Type DELETE to confirm'
          className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7c4dff]/60"
        />
        <button
          onClick={handleDelete}
          disabled={pending}
          className="px-4 py-2 rounded-pill bg-red-600/80 hover:bg-red-600 text-white disabled:opacity-50 lightning-cursor"
        >
          {pending ? 'Deleting…' : 'Delete account'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        We’ll sign you out on success.
      </p>
    </div>
  )
}