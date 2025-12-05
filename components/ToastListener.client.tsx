// components/ToastListener.client.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useToast } from "./ToastProvider.client";

/** Reads ?toast= from the URL, shows a toast, then cleans the query param. */
export default function ToastListener() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { show } = useToast();

  useEffect(() => {
    const code = params.get("toast");
    if (!code) return;

    // map known codes to messages
    const map: Record<string, { message: string; variant?: "success" | "error" | "info" }> = {
      saved:   { message: "Profile saved!", variant: "success" },
      deleted: { message: "Account deleted. Goodbye 👋", variant: "success" },
      loggedout: { message: "Logged out everywhere.", variant: "success" },
      error:   { message: "Something went wrong.", variant: "error" },
    };

    const { message, variant } = map[code] ?? { message: code, variant: "info" };
    show({ message, variant });

    // remove the query param without a full navigation
    const url = new URL(window.location.href);
    url.searchParams.delete("toast");
    window.history.replaceState({}, "", url.pathname + (url.search ? `?${url.searchParams}` : ""));
  }, [params, pathname, show]);

  return null;
}