// lib/haptics.ts
// Web "haptics": vibrate gently where supported (Android Chrome, some others).
// iOS Safari ignores navigator.vibrate — this fails silently (that's OK).
export function hapticLight() {
  if (typeof window === 'undefined') return;
  try {
    if ('vibrate' in navigator) (navigator as any).vibrate?.(12);
  } catch {
    /* no-op */
  }
}

export function hapticMedium() {
  if (typeof window === 'undefined') return;
  try {
    if ('vibrate' in navigator) (navigator as any).vibrate?.([10, 30]);
  } catch {
    /* no-op */
  }
}