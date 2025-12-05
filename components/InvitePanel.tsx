'use client';

import { useEffect, useMemo, useState } from 'react';

export default function InvitePanel() {
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/invites', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch invite');
        setInviteUrl(json.url);
      } catch (e: any) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('Join me on HYPED');
    const body = encodeURIComponent(`Use my invite link to join HYPED:\n\n${inviteUrl}\n`);
    return `mailto:?subject=${subject}&body=${body}`;
  }, [inviteUrl]);

  const smsHref = useMemo(() => {
    const body = encodeURIComponent(`Join me on HYPED: ${inviteUrl}`);
    return `sms:?&body=${body}`;
  }, [inviteUrl]);

  const copy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied!');
  };

  const shareNative = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join me on HYPED', text: 'Use my invite link:', url: inviteUrl });
      } catch { /* canceled */ }
    } else {
      copy();
    }
  };

  return (
    <div className="rounded-2xl border bg-black/5 dark:bg-white/5 p-5">
      <label className="text-sm opacity-70">Your share link</label>

      <div className="mt-2 flex items-center gap-3">
        <input
          readOnly
          value={loading ? 'Generating…' : (error ? `Error: ${error}` : inviteUrl)}
          className="flex-1 rounded-xl border bg-transparent px-3 py-2 text-sm"
        />
        <button
          onClick={copy}
          disabled={!inviteUrl || !!error}
          className="lightning-cursor rounded-xl border px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
        >
          Copy
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a href={mailtoHref}
           className="lightning-cursor rounded-xl border px-4 py-2 text-sm hover:bg-white/10 transition">
          Email invite
        </a>
        <a href={smsHref}
           className="lightning-cursor rounded-xl border px-4 py-2 text-sm hover:bg-white/10 transition">
          SMS invite
        </a>
        <button onClick={shareNative}
                className="lightning-cursor rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90 transition">
          Share (native)
        </button>
      </div>
    </div>
  );
}