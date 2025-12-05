'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'

export default function BannerUploader({
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
      // Optional: basic guardrails for banner shape
      if (file.size > 4 * 1024 * 1024) {
        toast.error('Please use an image under 4 MB.')
        setBusy(false)
        return
      }

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const key = `b_${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('banners')
        .upload(key, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: pub } = supabase.storage.from('banners').getPublicUrl(data.path)
      onChange(pub.publicUrl)
      toast.success('Banner updated! ⚡')
    } catch (err) {
      console.error(err)
      toast.error('Could not upload banner.')
    } finally {
      setBusy(false)
      // reset the input so re‑uploading same file works
      e.currentTarget.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm text-dim mb-2">Custom banner image</label>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="relative h-24 sm:h-28 md:h-32 bg-white/5">
          {value ? (
            <Image
              src={value}
              alt="Banner preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-soft text-sm">
              Recommended 1600×400 (4:1) — JPG/PNG
            </div>
          )}
        </div>
        <div className="p-3 flex items-center gap-3 bg-white/5 border-t border-white/10">
          <label className="brand-gradient text-white px-4 py-2 rounded-pill font-semibold shadow-cta hover:opacity-95 cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onFile}
              disabled={busy}
            />
            {busy ? 'Uploading…' : 'Upload'}
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-4 py-2 rounded-pill thin-border bg-white/5 text-white hover:bg-white/10"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}