// components/settings/PrivacyControls.tsx
'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initial: {
    default_visibility: 'public' | 'followers' | 'private'
    discoverable: boolean
    allow_messages: boolean
    show_activity_status: boolean
    hide_counts: boolean
  }
}

export default function PrivacyControls({ initial }: Props) {
  const supabase = createClient()
  const [pending, startTransition] = useTransition()

  const [defaultVisibility, setDefaultVisibility] =
    useState<'public' | 'followers' | 'private'>(initial.default_visibility)
  const [discoverable, setDiscoverable] = useState<boolean>(initial.discoverable)
  const [allowMessages, setAllowMessages] = useState<boolean>(initial.allow_messages)
  const [showActivity, setShowActivity] = useState<boolean>(initial.show_activity_status)
  const [hideCounts, setHideCounts] = useState<boolean>(initial.hide_counts)

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

  async function save() {
    setMsg(null); setErr(null)
    startTransition(async () => {
      const { data: me } = await supabase.auth.getUser()
      const uid = me.user?.id
      if (!uid) return toast(false, 'Not signed in.')

      const { error } = await supabase
        .from('profiles')
        .update({
          default_visibility: defaultVisibility,
          discoverable,
          allow_messages: allowMessages,
          show_activity_status: showActivity,
          hide_counts: hideCounts,
        })
        .eq('user_id', uid)

      if (error) toast(false, error.message)
      else toast(true, 'Privacy settings saved.')
    })
  }

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/10 last:border-b-0">
      {children}
    </div>
  )

  return (
    <div className="space-y-4">
      {msg && <div className="rounded-md bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm">{msg}</div>}
      {err && <div className="rounded-md bg-red-500/10 text-red-300 px-3 py-2 text-sm">{err}</div>}

      <Row>
        <div>
          <div className="font-medium">Default post visibility</div>
          <div className="text-xs text-muted-foreground">Who can see new hype posts by default.</div>
        </div>
        <select
          value={defaultVisibility}
          onChange={(e) => setDefaultVisibility(e.target.value as any)}
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7c4dff]/60"
        >
          <option value="public">Public</option>
          <option value="followers">Followers only</option>
          <option value="private">Private</option>
        </select>
      </Row>

      <Row>
        <div>
          <div className="font-medium">Discoverable</div>
          <div className="text-xs text-muted-foreground">Show my profile in Discover.</div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={discoverable}
            onChange={(e) => setDiscoverable(e.target.checked)}
            className="h-4 w-4 accent-[#7c4dff]"
          />
          <span className="text-sm">Enabled</span>
        </label>
      </Row>

      <Row>
        <div>
          <div className="font-medium">Allow direct messages</div>
          <div className="text-xs text-muted-foreground">People you follow can DM you.</div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={allowMessages}
            onChange={(e) => setAllowMessages(e.target.checked)}
            className="h-4 w-4 accent-[#7c4dff]"
          />
          <span className="text-sm">Enabled</span>
        </label>
      </Row>

      <Row>
        <div>
          <div className="font-medium">Show activity status</div>
          <div className="text-xs text-muted-foreground">Let followers see when you were last active.</div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={showActivity}
            onChange={(e) => setShowActivity(e.target.checked)}
            className="h-4 w-4 accent-[#7c4dff]"
          />
          <span className="text-sm">Enabled</span>
        </label>
      </Row>

      <Row>
        <div>
          <div className="font-medium">Hide counts</div>
          <div className="text-xs text-muted-foreground">Hide Hypes/Hyper counts from your profile.</div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={hideCounts}
            onChange={(e) => setHideCounts(e.target.checked)}
            className="h-4 w-4 accent-[#7c4dff]"
          />
          <span className="text-sm">Enabled</span>
        </label>
      </Row>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending}
          className="px-4 py-2 rounded-pill bg-[linear-gradient(135deg,#7c4dff_0%,#6a00ff_50%,#5b00ea_100%)] text-white font-semibold shadow-cta hover:opacity-95 disabled:opacity-50 lightning-cursor"
        >
          {pending ? 'Saving…' : 'Save privacy'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: These options expect columns in <code>profiles</code> —{' '}
        <code>default_visibility</code> (text), <code>discoverable</code> (bool),{' '}
        <code>allow_messages</code> (bool), <code>show_activity_status</code> (bool),{' '}
        <code>hide_counts</code> (bool).
      </p>
    </div>
  )
}