'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'

export default function AvatarPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (url: string | null) => void
}) {
  const supabase = createClient()
  const [busy, setBusy] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const ext = file.name.split('.').pop() || 'png'
      const path = `u_${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(data.path)
      onChange(pub.publicUrl)
      toast.success('Avatar updated! ⚡')
    } catch (err) {
      console.error(err)
      toast.error('Could not upload avatar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <label className="block text-sm text-dim mb-2">Avatar</label>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          {value ? (
            <Image src={value} alt="Avatar" fill className="object-cover" sizes="64px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-soft">No avatar</div>
          )}
        </div>
        <label className="brand-gradient text-white px-4 py-2 rounded-pill font-semibold shadow-cta hover:opacity-95 cursor-pointer">
          <input type="file" className="hidden" accept="image/*" onChange={onFile} disabled={busy} />
          {busy ? 'Uploading…' : 'Upload'}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="px-3 py-2 rounded-pill thin-border bg-white/5 text-white hover:bg-white/10"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}