'use client';

import { useEffect, useState } from 'react';

export default function InviteAcceptPage({ params }: { params: { code: string } }) {
  const { code } = params;
  const [state, setState] = useState<'loading'|'ok'|'error'>('loading');

  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/invites/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        setState('ok');
      } catch {
        setState('error');
      }
    })();
  }, [code]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        {state === 'loading' && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Verifying invite…</h1>
            <p className="text-sm opacity-80">One moment.</p>
          </>
        )}
        {state === 'ok' && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Welcome to HYPED 🎉</h1>
            <p className="text-sm opacity-80 mb-4">Your invite was recorded. Create an account or log in.</p>
            <div className="flex gap-3">
              <a href="/signup" className="rounded-lg bg-black text-white px-4 py-2 text-sm">Create account</a>
              <a href="/login" className="rounded-lg border px-4 py-2 text-sm">Log in</a>
            </div>
          </>
        )}
        {state === 'error' && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Invite error</h1>
            <p className="text-sm opacity-80">We couldn’t verify this invite link.</p>
          </>
        )}
      </div>
    </div>
  );
}