// FILE: components/NewDailyHypeButton.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

type EventType = 'career' | 'school' | 'sports' | 'personal'
type Visibility = 'public' | 'followers' | 'following' | 'private'

export default function NewDailyHypeButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('career')
  const [eventAt, setEventAt] = useState<string>('') // HTML datetime-local value
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const iso = eventAt ? new Date(eventAt).toISOString() : null

      const { error } = await supabase.from('daily_events').insert({
        user_id: userId,
        title,
        type,
        event_at: iso,
        visibility,
      })

      if (error) throw error

      toast({ title: 'Daily hype created!' })
      setOpen(false)
      setTitle('')
      setType('career')
      setEventAt('')
      setVisibility('public')
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error creating daily hype', description: err?.message ?? 'Unknown error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-4 py-2 brand-gradient text-white shadow-brand"
      >
        + New Daily Hype
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[color:var(--brand-dark)] text-white">
            <div className="p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Daily Hype</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 outline-none"
                  placeholder="Big interview, math test, game day…"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 outline-none"
                >
                  <option value="career">Career</option>
                  <option value="school">School</option>
                  <option value="sports">Sports</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">When</label>
                <input
                  type="datetime-local"
                  value={eventAt}
                  onChange={(e) => setEventAt(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-white/70">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 outline-none"
                >
                  <option value="public">Public</option>
                  <option value="followers">Hypers (your followers)</option>
                  <option value="following">Hypees (people you follow)</option>
                  <option value="private">Private (only you)</option>
                </select>
                <p className="text-xs text-white/55">
                  Public: anyone · Hypers: followers · Hypees: people you follow · Private: only you
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-full brand-gradient text-white shadow-brand disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}