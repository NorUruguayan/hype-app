// components/BottomNav.tsx
import Link from "next/link";

type Props = {
  username?: string | null;
};

function NavIcon({ name }: { name: "feed" | "discover" | "post" | "profile" }) {
  // Simple inline SVGs (no extra deps)
  const common = "w-6 h-6";
  switch (name) {
    case "feed":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M4 12h10M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "discover":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "post":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "profile":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function BottomNav({ username }: Props) {
  const profileHref = username ? `/u/${username.toLowerCase()}` : "/settings";
  const Item = ({
    href,
    label,
    icon,
    prominent = false,
  }: {
    href: string;
    label: string;
    icon: Props extends never ? never : React.ReactNode;
    prominent?: boolean;
  }) => (
    <Link
      href={href}
      className={[
        "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl",
        prominent
          ? "font-semibold shadow-cta bg-brand-gradient text-slate-900"
          : "text-foreground/90 hover:text-foreground bg-white/0 hover:bg-white/5",
      ].join(" ")}
    >
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
      aria-label="Bottom navigation"
    >
      <div className="mx-auto max-w-xl grid grid-cols-4 items-center gap-2">
        <Item href="/feed" label="Feed" icon={<NavIcon name="feed" />} />
        <Item href="/discover" label="Discover" icon={<NavIcon name="discover" />} />
        <Item href="/daily" label="Post" icon={<NavIcon name="post" />} prominent />
        <Item href={profileHref} label="Profile" icon={<NavIcon name="profile" />} />
      </div>
    </nav>
  );
}