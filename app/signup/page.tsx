'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)

    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (clean.length < 3) {
      setErr('Username must be at least 3 characters.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: clean,
            display_name: displayName || clean,
          },
        },
      })
      if (error) throw error

      setMsg('Check your email to confirm your account. We’ll create your profile automatically after you click the link.')
    } catch (e: any) {
      setErr(e?.message ?? 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      <div className="h-20 w-full border-b border-white/10" />
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-7 backdrop-blur shadow-brand">
          <h1 className="text-2xl font-extrabold text-white text-center mb-6">
            Create your HYPE page
          </h1>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                placeholder="yourname"
                pattern="[a-z0-9_]{3,30}"
              />
              <p className="mt-1 text-xs text-white/50">hype.app/@{username || 'yourname'}</p>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {err}
              </div>
            )}
            {msg && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3 font-semibold text-white shadow-brand hover:opacity-90 transition brand-gradient disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create My Hype Page'}
            </button>
          </form>

          <p className="text-center mt-6 text-white/70">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-white hover:opacity-90">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}