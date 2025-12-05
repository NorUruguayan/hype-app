// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TopBarNotifications from "@/components/TopBarNotifications.client";
import {
  IconCompass,
  IconDoor,
  IconGear,
  IconPlus,
  IconSparkles,
} from "@/components/icons";

type AvatarState = { initial: string; avatarUrl?: string };

function initialFrom(name?: string | null, email?: string | null) {
  const n = (name ?? "").trim();
  if (n) return n[0]!.toUpperCase();
  const e = (email ?? "").trim();
  if (e) return e[0]!.toUpperCase();
  return "•";
}

// Simple inline Home icon (no extra imports)
function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={16} height={16} {...props}>
      <path
        d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<AvatarState>({ initial: "•" });

  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Load avatar/name (no need to fetch username now that we removed "Your profile")
  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAvatar({ initial: "•" });
        return;
      }

      const meta = (user.user_metadata ?? {}) as Record<string, any>;
      const displayName =
        meta.name ??
        meta.full_name ??
        meta.fullName ??
        meta.given_name ??
        meta.user_name ??
        "";

      setAvatar({
        initial: initialFrom(displayName, user.email ?? meta.email),
        avatarUrl: (meta.avatar_url ?? meta.picture ?? "") || undefined,
      });
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe();
  }, []);

  // Close menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      {/* Stripes + dynamic tint */}
      <div className="header-stripe absolute inset-0 h-14 pointer-events-none" />
      <div
        aria-hidden
        className="absolute inset-0 h-14 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--brand-1) 6%, transparent), transparent)",
          backdropFilter: "saturate(1.05) blur(6px)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3))",
          boxShadow:
            "0 8px 22px color-mix(in oklab, var(--brand-2) 35%, #000 65%)",
          opacity: 0.8,
        }}
      />

      <div className="app-container h-14 relative flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="no-tap-highlight inline-flex items-center gap-2 rounded-lg px-2 py-1 brand-press"
          aria-label="HYPED home"
        >
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-[2px] brand-gradient"
          />
          <span className="text-sm font-semibold tracking-wide">HYPED</span>
        </Link>

        {/* Right actions */}
        <nav className="flex items-center gap-2">
          <TopBarNotifications />

          <Link
            href="/daily"
            className="btn-cta no-tap-highlight h-8 px-3 text-[13px] rounded-xl inline-flex items-center justify-center font-medium"
            aria-label="New Daily Hype"
            title="New Daily Hype"
          >
            <IconPlus width={16} height={16} className="mr-1" />
            New Daily Hype
          </Link>

          {/* Avatar / menu */}
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              className="no-tap-highlight grid h-8 w-8 place-items-center rounded-full overflow-hidden"
              style={{
                background: "var(--chip-bg)",
                boxShadow: "0 0 0 1px var(--chip-ring) inset",
                color: "var(--ink-2)",
                fontSize: "13px",
                fontWeight: 600,
              }}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls="user-menu"
              onClick={() => setOpen((v) => !v)}
              title="Account"
            >
              {avatar.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar.avatarUrl}
                  alt="User"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span aria-hidden>{avatar.initial}</span>
              )}
            </button>

            {open && (
              <div
                ref={menuRef}
                id="user-menu"
                role="menu"
                aria-label="User menu"
                className="menu-surface absolute right-0 mt-2 w-56 z-50"
              >
                {/* Feed */}
                <Link
                  href="/feed"
                  role="menuitem"
                  className="menu-item flex items-center gap-2"
                >
                  <IconHome className="opacity-90" />
                  Feed
                </Link>

                {/* Discover */}
                <Link
                  href="/discover"
                  role="menuitem"
                  className="menu-item flex items-center gap-2"
                >
                  <IconCompass width={16} height={16} className="opacity-90" />
                  Discover
                </Link>

                {/* Invite */}
                <Link
                  href="/invite"
                  role="menuitem"
                  className="menu-item flex items-center gap-2"
                >
                  <IconSparkles width={16} height={16} className="opacity-90" />
                  Invite friends
                </Link>

                {/* Settings */}
                <Link
                  href="/settings"
                  role="menuitem"
                  className="menu-item flex items-center gap-2"
                >
                  <IconGear width={16} height={16} className="opacity-90" />
                  Settings
                </Link>

                <div className="divider my-1" />

                {/* New Daily Hype (prominent) */}
                <Link
                  href="/daily"
                  role="menuitem"
                  className="menu-item flex items-center gap-2 font-semibold"
                >
                  <IconPlus width={16} height={16} className="opacity-90" />
                  New Daily Hype
                </Link>

                {/* Sign out */}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="menu-item flex items-center gap-2 text-red-300 w-full"
                  >
                    <IconDoor width={16} height={16} className="opacity-90" />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}