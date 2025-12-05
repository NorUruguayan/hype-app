"use client";

import { useEffect, useRef, useState } from "react";

export default function InviteShare({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function triggerFlash() {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 450);
    return () => clearTimeout(t);
  }

  function showCopiedToast() {
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 1400);
    return () => clearTimeout(t);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      triggerFlash();
      showCopiedToast();
      const t = setTimeout(() => setCopied(false), 1500);
      return () => clearTimeout(t);
    } catch {
      setCopied(false);
      // Fallback: select text so user can copy manually
      inputRef.current?.select();
      alert("Copy failed. Try selecting the text and copying manually.");
    }
  }

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "HYPED",
          text: "Hype me up here!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        triggerFlash();
        showCopiedToast();
        const t = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(t);
      }
    } catch {
      /* user cancelled / unsupported – ignore */
    }
  }

  // Keyboard accessibility: Ctrl/Cmd+C while input focused
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        setCopied(true);
        triggerFlash();
        showCopiedToast();
        const t = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(t);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      {/* Flash overlay */}
      {flash && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl confetti-pop"
          style={{
            background:
              "radial-gradient(300px 120px at 50% 0%, rgba(255,255,255,.16), transparent 70%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,.08) inset",
          }}
        />
      )}

      <label className="block text-sm text-white/70 mb-2">Your share link</label>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          readOnly
          value={shareUrl}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          onClick={copyLink}
          className="px-3 py-2 rounded-xl thin-border bg-white/5 text-white hover:bg-white/10"
          aria-live="polite"
          aria-label={copied ? "Copied" : "Copy link"}
        >
          {copied ? "Copied! 🎉" : "Copy"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          className="px-4 py-2 rounded-pill bg-white/10 hover:bg-white/20"
          href={`mailto:?subject=Hype%20me%20up&body=Hype%20me%20up%20here!%20${encodeURIComponent(
            shareUrl
          )}`}
        >
          Email invite
        </a>
        <a
          className="px-4 py-2 rounded-pill bg-white/10 hover:bg-white/20"
          href={`sms:?&body=Hype%20me%20up%20here!%20${encodeURIComponent(
            shareUrl
          )}`}
        >
          SMS invite
        </a>
        <button
          type="button"
          onClick={nativeShare}
          className="px-4 py-2 rounded-pill bg-white/10 hover:bg-white/20"
        >
          Share (native)
        </button>
      </div>

      {/* Tiny toast */}
      {showToast && (
        <div
          role="status"
          className="menu-surface fixed bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 text-sm"
          style={{
            background: "rgba(0,0,0,.65)",
            boxShadow: "0 12px 28px rgba(0,0,0,.55)",
          }}
        >
          Copied! 🎉
        </div>
      )}
    </div>
  );
}