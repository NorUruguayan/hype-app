"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Writes a `data-page="..."` attribute on <body> based on the current route.
 * CSS uses this to swap backgrounds and accent colors per page.
 */
export default function RouteBackdrop() {
  const pathname = usePathname();

  useEffect(() => {
    const p = (pathname || "/").toLowerCase();

    let page = "default";
    if (p.startsWith("/login")) page = "sunrise";
    else if (p.startsWith("/feed")) page = "teal";
    else if (p.startsWith("/discover")) page = "teal";
    else if (p.startsWith("/daily")) page = "peach";
    else if (p.startsWith("/notifications")) page = "coral";
    else if (p.startsWith("/settings")) page = "sand";
    else if (p.startsWith("/invite")) page = "teal";

    document.body.dataset.page = page;
    return () => { /* no-op */ };
  }, [pathname]);

  return null;
}