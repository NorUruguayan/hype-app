"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const inputBase =
    "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/60 " +
    "focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/30 disabled:opacity-50";

  async function signInOAuth(provider: "google" | "github") {
    if (oauthLoading) return;
    setOauthLoading(provider);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
      // Supabase will redirect.
    } catch (err: any) {
      alert(err?.message ?? "Could not start sign in.");
      setOauthLoading(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message || "Login failed");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function onForgot() {
    if (!email) {
      alert("Enter your email first, then click “Forgot password?”.");
      return;
    }
    if (sendingReset) return;
    setSendingReset(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      alert("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      alert(err?.message ?? "Could not send reset email.");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* OAuth */}
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => signInOAuth("google")}
          disabled={!!oauthLoading}
          className="w-full rounded-pill thin-border bg-white/5 text-white hover:bg-white/10 px-4 py-2 disabled:opacity-50"
        >
          {oauthLoading === "google" ? "Connecting…" : "Continue with Google"}
        </button>
        <button
          type="button"
          onClick={() => signInOAuth("github")}
          disabled={!!oauthLoading}
          className="w-full rounded-pill thin-border bg-white/5 text-white hover:bg-white/10 px-4 py-2 disabled:opacity-50"
        >
          {oauthLoading === "github" ? "Connecting…" : "Continue with GitHub"}
        </button>
      </div>

      <div className="flex items-center gap-3 text-white/70">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Email + Password */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-white/70">Email</label>
            <button
              type="button"
              onClick={onForgot}
              disabled={sendingReset}
              className="text-xs underline hover:no-underline text-white/80 disabled:opacity-50"
            >
              {sendingReset ? "Sending…" : "Forgot password?"}
            </button>
          </div>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Password</label>
          <div className="flex items-center gap-2">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputBase}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-white/60 mt-1">At least 6 characters.</p>
        </div>

        <div className="pt-1 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-cta text-black px-4 py-2 rounded-pill font-semibold disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setEmail("");
              setPassword("");
            }}
            className="px-4 py-2 rounded-pill thin-border bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}