// FILE: components/AvatarUploader.tsx
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId: string
  value: string | null
  onChange: (url: string | null) => void
}

export default function AvatarUploader({ userId, value, onChange }: Props) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value)

  const pick = () => inputRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)

    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`

      // upload
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr

      // public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = data?.publicUrl ?? null

      setPreview(url)
      onChange(url)
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const clearAvatar = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white/10">
        {preview ? (
          <Image src={preview} alt="Avatar" fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/60">No avatar</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="px-3 py-1.5 rounded-full brand-gradient text-white shadow-brand hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : (preview ? 'Change' : 'Upload')}
        </button>
        {preview && (
          <button
            type="button"
            onClick={clearAvatar}
            className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            Remove
          </button>
        )}
      </div>

      {error && <div className="text-xs text-red-300/80">{error}</div>}
    </div>
  )
}