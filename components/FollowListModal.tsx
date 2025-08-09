// FILE: components/FollowListModal.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FollowButton from './FollowButton'

type Row = { id: string; username: string; display_name: string | null }

export default function FollowListModal({
  userId,
  mode,
  open,
  onClose,
  title,
}: {
  userId: string
  mode: 'followers' | 'following' // followers = Hypers, following = Hypees
  open: boolean
  onClose: () => void
  title: string
}) {
  const supabase = createClient()
  const [rows, setRows] = useState<Row[] | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Load list
  useEffect(() => {
    if (!open) return
    ;(async () => {
      if (mode === 'followers') {
        // Who follows this user
        const { data } = await supabase
          .from('follows')
          .select('follower_id, users:follower_id ( id, username, display_name )')
          .eq('followee_id', userId)
          .order('created_at', { ascending: false })
        setRows((data ?? []).map((r: any) => r.users).filter(Boolean))
      } else {
        // Who this user follows
        const { data } = await supabase
          .from('follows')
          .select('followee_id, users:followee_id ( id, username, display_name )')
          .eq('follower_id', userId)
          .order('created_at', { ascending: false })
        setRows((data ?? []).map((r: any) => r.users).filter(Boolean))
      }
    })()
  }, [open, mode, supabase, userId])

  // Close on outside click/esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div ref={panelRef} className="w-full max-w-md rounded-2xl border border-white/10 bg-[color:var(--brand-dark)]">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-white/70 hover:text-white" onClick={onClose}>✕</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/10">
          {rows === null ? (
            <div className="p-4 text-white/60">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-white/60">No one yet.</div>
          ) : (
            rows.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center text-white font-bold">
                    {(u.display_name?.[0] || u.username?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="truncate">{u.display_name || u.username}</div>
                    <div className="text-white/60 text-sm truncate">@{u.username}</div>
                  </div>
                </div>
                {/* Follow/Unfollow inline */}
                <FollowButton profileUserId={u.id} />
              </div>
            ))
          )}
        </div>
        <div className="p-3 text-right">
          <button className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}