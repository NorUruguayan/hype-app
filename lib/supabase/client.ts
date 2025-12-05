// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Singleton browser Supabase client (used in Client Components).
 * Uses NEXT_PUBLIC_ env vars and persists the session in storage.
 * Exports both `createClient()` (what many files import) and `getClient()`.
 */
export function createClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  _client = createBrowserClient(url, anon, {
    auth: {
      // PKCE flow works well with OAuth (Google/Apple)
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}

// Alias so existing code that calls getClient() still works
export const getClient = createClient;

export type { SupabaseClient };