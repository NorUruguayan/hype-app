'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      if (!data.user) throw new Error('Login failed.')

      // get username for redirect
      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', data.user.id)
        .maybeSingle()

      router.push(profile?.username ? `/@${profile.username}` : '/')
    } catch (e: any) {
      setErr(e?.message ?? 'Login failed.')
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
            Welcome back
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
              <label className="block text-sm text-white/70 mb-1">Password</label>
              <input
                type="password"
                required
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3 font-semibold text-white shadow-brand hover:opacity-90 transition brand-gradient disabled:opacity-60"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-6 text-white/70">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-white hover:opacity-90">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}