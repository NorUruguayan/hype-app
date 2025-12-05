"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavIcon({ name, active }: { name: "feed" | "discover" | "post" | "profile"; active?: boolean }) {
  const cls = `w-6 h-6 ${active ? "opacity-100" : "opacity-80"}`;
  switch (name) {
    case "feed":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M4 12h10M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "discover":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "post":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "profile":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function MobileNav({
  username,
  discoverHasNew = false,
}: {
  username?: string;
  discoverHasNew?: boolean; // <— toggle the red dot
}) {
  const pathname = usePathname();
  const isActive = (href: string | RegExp) =>
    typeof href === "string" ? pathname === href : href.test(pathname);

  const profileHref = username ? `/u/${username}` : "/settings";

  const Item = ({
    href,
    label,
    icon,
    active,
    prominent = false,
    showDot = false,
  }: {
    href: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    prominent?: boolean;
    showDot?: boolean;
  }) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition",
        prominent
          ? "font-semibold shadow-cta bg-brand-gradient text-slate-900"
          : active
          ? "text-white bg-white/10"
          : "text-foreground/90 hover:text-foreground bg-white/0 hover:bg-white/5",
      ].join(" ")}
    >
      {/* red dot */}
      {showDot && !active && (
        <span
          aria-hidden
          className="absolute -top-0.5 right-2 h-2 w-2 rounded-full bg-red-500"
        />
      )}
      {icon}
      <span className="text-[11px] leading-none">{label}</span>
    </Link>
  );

  return (
    <nav
      className="
        sm:hidden fixed bottom-0 inset-x-0 z-50
        bg-zinc-900/70 backdrop-blur
        border-t border-white/10
        px-4 py-[10px]
        [padding-bottom:env(safe-area-inset-bottom)]
      "
      aria-label="Mobile navigation"
    >
      <div className="mx-auto max-w-xl grid grid-cols-4 items-center gap-2">
        <Item
          href="/feed"
          label="Feed"
          active={isActive("/feed")}
          icon={<NavIcon name="feed" active={isActive("/feed")} />}
        />
        <Item
          href="/discover"
          label="Discover"
          active={isActive(/^\/discover(\/.*)?$/)}
          icon={<NavIcon name="discover" active={isActive(/^\/discover(\/.*)?$/)} />}
          showDot={discoverHasNew}
        />
        <Item
          href="/daily"
          label="Post"
          prominent
          active={isActive("/daily")}
          icon={<NavIcon name="post" active={isActive("/daily")} />}
        />
        <Item
          href={profileHref}
          label="Profile"
          active={isActive(/^\/(u\/[^/]+|settings)$/)}
          icon={<NavIcon name="profile" active={isActive(/^\/(u\/[^/]+|settings)$/)} />}
        />
      </div>
    </nav>
  );
}