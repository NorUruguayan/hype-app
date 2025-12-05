"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight, route-aware background layer.
 * It renders ONE fixed element behind the entire app and swaps classes by route.
 */
export default function PageSkin() {
  const pathname = usePathname() || "/";

  // Map routes -> page skins (feel free to tune)
  const skin = useMemo(() => {
    if (pathname.startsWith("/login") || pathname.startsWith("/landing")) return "sunrise";
    if (pathname.startsWith("/daily")) return "sunrise";
    if (pathname.startsWith("/feed")) return "lagoon";
    if (pathname.startsWith("/discover")) return "mint";
    if (pathname.startsWith("/notifications")) return "apricot";
    if (pathname.startsWith("/invite")) return "mint";
    if (pathname.startsWith("/settings")) return "dune";
    // profile pages
    if (pathname.startsWith("/me") || pathname.startsWith("/u/")) return "lagoon";
    return "lagoon";
  }, [pathname]);

  // Full-bleed, behind everything (no layout shift)
  return <div aria-hidden className={`page-skin page-skin--${skin}`} />;
}