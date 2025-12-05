// components/settings/AvatarBannerUploader.tsx
'use client'

import { useState, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initial: {
    avatar_url?: string | null
    banner_url?: string | null
  }
}

export default function AvatarBannerUploader({ initial }: Props) {
  const supabase = createClient()
  const [pending, startTransition] = useTransition()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url ?? null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(initial.banner_url ?? null)

  const avatarInput = useRef<HTMLInputElement | null>(null)
  const bannerInput = useRef<HTMLInputElement | null>(null)

  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  function toast(ok: boolean, text: string) {
    setErr(ok ? null : text); setMsg(ok ? text : null)
    setTimeout(() => { setMsg(null); setErr(null) }, 2500)
  }

  async function upload(kind: 'avatar' | 'banner', file: File) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const mime = file.type || (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`)
    const { data: me } = await supabase.auth.getUser()
    const uid = me.user?.id
    if (!uid) return toast(false, 'Not signed in.')

    const bucket = 'public' // change if you use a different bucket
    const path = `${kind}s/${uid}-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: mime,
      upsert: true,
    })
    if (upErr) return toast(false, upErr.message)

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
    const url = pub.publicUrl

    const { error: profErr } = await supabase
      .from('profiles')
      .update(kind === 'avatar' ? { avatar_url: url } : { banner_url: url })
      .eq('user_id', uid)

    if (profErr) return toast(false, profErr.message)

    if (kind === 'avatar') setAvatarUrl(url)
    else setBannerUrl(url)

    toast(true, `${kind === 'avatar' ? 'Avatar' : 'Banner'} updated.`)
  }

  function pick(kind: 'avatar' | 'banner') {
    (kind === 'avatar' ? avatarInput.current : bannerInput.current)?.click()
  }

  return (
    <div className="rounded-xl border border-white/10 p-6">
      <h2 className="text-lg font-medium mb-4">Avatar & Banner</h2>

      {msg && <div className="rounded-md bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm mb-3">{msg}</div>}
      {err && <div className="rounded-md bg-red-500/10 text-red-300 px-3 py-2 text-sm mb-3">{err}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Avatar</div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : null}
            </div>
            <button
              type="button"
              onClick={() => pick('avatar')}
              disabled={pending}
              className="px-3 py-2 rounded-pill bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 lightning-cursor"
            >
              {pending ? 'Uploading…' : 'Upload avatar'}
            </button>
            <input
              type="file" accept="image/*" ref={avatarInput} className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                startTransition(() => upload('avatar', f))
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Recommended: square ≥ 256×256.</p>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Banner</div>
          <div className="h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            {bannerUrl ? <img src={bannerUrl} alt="banner" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => pick('banner')}
              disabled={pending}
              className="px-3 py-2 rounded-pill bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 lightning-cursor"
            >
              {pending ? 'Uploading…' : 'Upload banner'}
            </button>
            <input
              type="file" accept="image/*" ref={bannerInput} className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                startTransition(() => upload('banner', f))
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Recommended: 1200×300 or similar.</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Uses Supabase Storage bucket <code>public</code>. Ensure it exists and is public.
      </p>
    </div>
  )
}