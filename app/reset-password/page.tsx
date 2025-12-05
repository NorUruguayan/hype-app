'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/Card'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/feed'

  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [loading, setLoading] = useState(false)

  const inputBase =
    'w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-soft ' +
    'focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/30 disabled:opacity-50'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (pw1.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }
    if (pw1 !== pw2) {
      alert('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 })
      if (error) throw error
      alert('Password updated! You’re signed in.')
      router.replace(next)
      router.refresh()
    } catch (err: any) {
      alert(err?.message ?? 'Could not update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-10">
        <Card className="p-8 rounded-2xl border border-white/10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Set a new password</h1>
          <p className="text-soft mt-2 text-sm">Enter your new password below.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm text-dim mb-2">New password</label>
              <input
                type="password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                className={inputBase}
                placeholder="New password"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-dim mb-2">Confirm password</label>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                className={inputBase}
                placeholder="Confirm password"
                minLength={6}
                required
              />
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="brand-gradient text-white px-4 py-2 rounded-pill font-semibold shadow-cta hover:opacity-95 disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => { setPw1(''); setPw2('') }}
                className="px-4 py-2 rounded-pill thin-border bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}