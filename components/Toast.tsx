'use client'
import { createContext, useCallback, useContext, useState } from 'react'

type Toast = { id: number; text: string }
const ToastCtx = createContext<{ push: (text: string) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((text: string) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200)
  }, [])
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="rounded-full bg-white/90 text-black px-4 py-2 shadow">
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.push
}