// components/MobileNewHypeFab.client.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNewHypeFab() {
  const pathname = usePathname();
  // Hide FAB on the composer itself
  if (pathname?.startsWith("/daily")) return null;

  return (
    <Link
      href="/daily"
      aria-label="Create new daily hype"
      className={[
        "md:hidden fixed z-40",
        "right-[calc(env(safe-area-inset-right)+16px)]",
        "bottom-[calc(env(safe-area-inset-bottom)+16px)]",
        "h-14 w-14 rounded-full shadow-lg grid place-items-center",
        "text-black text-2xl leading-none",
        "bg-gradient-to-br from-amber-400 to-yellow-300",
        "hover:from-amber-300 hover:to-yellow-200",
        "active:scale-[0.98] transition-transform",
        "ring-1 ring-black/10",
      ].join(" ")}
    >
      ＋
    </Link>
  );
}