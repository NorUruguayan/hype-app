// components/ThemeSelect.client.tsx
'use client';

import * as React from 'react';

export type Theme = 'system' | 'light' | 'dark';

type Props = {
  initial: Theme;
  onChange: (t: Theme) => void;
};

export default function ThemeSelect({ initial, onChange }: Props) {
  const [theme, setTheme] = React.useState<Theme>(initial);

  // Apply immediately and persist (guard for SSR)
  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch {}
    onChange(theme);
  }, [theme, onChange]);

  const Btn = ({ v, children }: { v: Theme; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setTheme(v)}
      className={`chip ${theme === v ? 'chip-active' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex gap-2">
      <Btn v="system">System</Btn>
      <Btn v="light">Light</Btn>
      <Btn v="dark">Dark</Btn>
    </div>
  );
}