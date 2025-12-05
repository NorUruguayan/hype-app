"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Shows a celebratory overlay when the URL has ?toast=streak
 * (e.g. after createDailyHype redirects to /feed?toast=streak).
 * Includes confetti, share + invite CTAs, and removes the query param on close.
 */
export default function PostSuccessCelebration() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const shouldOpen = sp.get("toast") === "streak";
  const [open, setOpen] = useState(shouldOpen);
  useEffect(() => setOpen(shouldOpen), [shouldOpen]);

  // When the user closes, clean the URL (drop ?toast=streak).
  const cleanUrl = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("toast");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const onClose = () => {
    setOpen(false);
    cleanUrl();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Post success celebration"
      className="fixed inset-0 z-[999] grid place-items-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[min(92vw,520px)] cursor-default rounded-2xl bg-neutral-950/90 p-6 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <ConfettiBurst />

        <div className="mb-2 text-center text-2xl font-bold">Streak +1 🔥</div>
        <p className="mx-auto mb-4 max-w-[36ch] text-center text-sm opacity-80">
          Nice! You kept your Daily Hype going. Keep it rolling or invite a friend to
          hype with you for bonus rewards.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            className="btn-cta"
            onClick={async () => {
              const text = "I kept my HYPED streak alive 🔥 Come hype with me!";
              const url = typeof window !== "undefined" ? window.location.origin : "";
              if (navigator.share) {
                try {
                  await navigator.share({ title: "HYPED", text, url });
                } catch {}
              } else {
                try {
                  await navigator.clipboard.writeText(`${text} ${url}`);
                } catch {}
              }
            }}
          >
            Share win
          </button>

          <Link href="/invite" className="btn-ghost">
            Invite a friend
          </Link>

          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** Light-weight CSS confetti (no extra deps). */
function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // vw
        delay: Math.random() * 0.3,
        duration: 1.2 + Math.random() * 0.8,
        size: 6 + Math.floor(Math.random() * 8),
        rotate: Math.random() * 360,
      })),
    []
  );

  return (
    <>
      <div className="pointer-events-none absolute -top-4 left-0 right-0 h-[160px] overflow-visible">
        {pieces.map((p) => (
          <span
            key={p.id}
            style={{
              left: `${p.left}vw`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rotate}deg)`,
            }}
            className="confetti-piece"
          />
        ))}
      </div>

      <style jsx>{`
        .confetti-piece {
          position: fixed;
          top: -20px;
          border-radius: 2px;
          background: linear-gradient(135deg, #ffd400, #ff8a00, #ff4d00);
          animation-name: confettiFall, confettiSpin;
          animation-timing-function: ease-in, linear;
          animation-iteration-count: 1, infinite;
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0.95;
          }
          100% {
            transform: translateY(120vh) scale(1) rotate(0deg);
            opacity: 0.9;
          }
        }
        @keyframes confettiSpin {
          from {
            filter: hue-rotate(0deg);
          }
          to {
            filter: hue-rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}