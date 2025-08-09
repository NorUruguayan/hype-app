import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileHeaderCard from '@/components/ProfileHeaderCard'
import InviteFriendsButton from '@/components/InviteFriendsButton'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const handle = username.replace('@', '')
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, bio')
    .eq('username', handle)
    .maybeSingle()

  if (!profile) notFound()
  const uid = profile.user_id

  const [{ count: hypeCount }, { count: followersCount }, { count: followingCount }] =
    await Promise.all([
      supabase.from('hypes').select('id', { count: 'exact', head: true }).eq('to_user_id', uid),
      supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followee_id', uid),
      supabase.from('follows').select('followee_id', { count: 'exact', head: true }).eq('follower_id', uid),
    ])

  return (
    <div className="min-h-screen bg-[color:var(--brand-dark)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileHeaderCard
          userId={uid}
          username={profile.username}
          displayName={profile.display_name || profile.username}
          bio={profile.bio || ''}
          hypeCount={hypeCount ?? 0}
          followersCount={followersCount ?? 0}
          followingCount={followingCount ?? 0}
        />

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">⚡⚡⚡ Hype Collection</h2>

          {(hypeCount ?? 0) === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/80">
              <div className="mb-3 font-semibold">No hypes yet</div>
              <div className="flex gap-2 flex-wrap">
                {/* Invite friends (client component) */}
                <InviteFriendsButton path={`/@${profile.username}`} />

                {/* Discover people (styled like Invite friends) */}
                <a
                  href="/demo"
                  className="rounded-full px-4 py-2 font-semibold text-white shadow-brand hover:opacity-90 active:opacity-95 transition
                             bg-gradient-to-r from-[#9E5BFF] to-[#FF5BB4]"
                >
                  Discover people
                </a>
              </div>
            </div>
          ) : (
            <div className="text-white/70">
              {/* TODO: render your HypeCollection here */}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}