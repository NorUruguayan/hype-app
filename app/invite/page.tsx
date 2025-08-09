// FILE: app/invite/page.tsx
import { getSiteUrl } from '@/lib/site'
import { createClient } from '@/lib/supabase/server'
import InviteClient from './shim.client'

export default async function InvitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username: string | null = null
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle()
    username = p?.username ?? null
  }

  // Build the base share url on the server (robust behind proxies)
  const base = getSiteUrl()
  const shareUrl = username ? `${base}/@${username}` : base

  return <InviteClient initialShareUrl={shareUrl} />
}