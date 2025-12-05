// FILE: components/Toast.tsx
'use client'

/**
 * Minimal toast shim so code can import:
 *   import { useToast } from '@/components/Toast'
 *
 * Replace this later with your real toast system (e.g., shadcn/sonner).
 */

type ToastOptions = {
  title?: string
  description?: string
}

export function useToast() {
  return {
    toast: ({ title, description }: ToastOptions = {}) => {
      const message = [title, description].filter(Boolean).join(' — ')
      // Non-blocking: log to console and optionally show alert in dev
      console.log('[toast]', message)
      if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
        // Quick visual feedback while developing
        // (swap this out for a real UI lib later)
        // eslint-disable-next-line no-alert
        if (message) alert(message)
      }
    },
  }
}

/**
 * Some projects import the default just to mount a provider.
 * We don’t need one for this shim, so render nothing.
 */
export default function ToastProvider() {
  return null
}