// FILE: lib/supabase/ensureProfile.ts
import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Ensures there's a row in public.profiles for the given user.
 * Uses profiles.user_id as the unique key and upserts safely under RLS.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
) {
  if (!user) return

  // Clean username guess (metadata or email prefix), lowercase, a-z0-9_
  const raw =
    (user.user_metadata?.username as string | undefined) ??
    (user.email?.split('@')[0] ?? '')
  const usernameGuess = raw.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    raw ||
    'User'

  // Is there already a profile for this user?
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (selErr && selErr.code !== 'PGRST116') {
    // Non-"no rows" error; surface in console but keep going to try upsert
    // eslint-disable-next-line no-console
    console.warn('ensureProfile select error:', selErr)
  }

  if (!existing) {
    // Create or update by user_id (requires unique index on profiles.user_id)
    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          username: usernameGuess,
          display_name: displayName,
          bio: '',
        },
        { onConflict: 'user_id' }
      )

    if (upsertErr) {
      // eslint-disable-next-line no-console
      console.warn('ensureProfile upsert error:', upsertErr)
    }
  }
}