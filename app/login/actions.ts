"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";

async function getSiteUrl() {
  // 1) Prefer explicit env
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // 2) Fallback to request headers
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = (h.get("x-forwarded-proto") || "http").split(",")[0];
  return `${proto}://${host}`;
}

/**
 * Send Supabase magic link to the provided email.
 * Redirects back to /login with ?sent=1 on success, or ?error=... on failure.
 */
export async function sendMagicLink(email: string) {
  if (!email || typeof email !== "string") {
    redirect("/login?error=" + encodeURIComponent("Email is required"));
  }

  const supabase = await getServerClient();
  const site = await getSiteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Important: this is where the email link will return to
      emailRedirectTo: `${site}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/login?sent=1");
}