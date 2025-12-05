// components/SignupForm.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "@/components/Toast";

export default function SignupForm() {
  const supabase = createClient();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputBase =
    "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-soft transition " +
    "focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/30 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message || "Sign up failed");
        return;
      }
      toast.success("Check your email to confirm ✉️");
      router.push(next);
      router.refresh();
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ... fields unchanged ... */}
    </form>
  );
}