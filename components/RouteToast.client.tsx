"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

type ToastKind = "success" | "info" | "error";

export default function RouteToast() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [kind, setKind] = useState<ToastKind>("success");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const toast = searchParams.get("toast");
    if (!toast) return;

    let text = "";
    let k: ToastKind = "success";

    switch (toast) {
      case "streak":
        text = "Streak +1 🔥 You kept your daily hype going!";
        k = "success";
        break;
      case "posted":
        text = "Posted! Your hype is live.";
        k = "success";
        break;
      case "error":
        text = "Something went wrong. Please try again.";
        k = "error";
        break;
      default:
        text = toast;
        k = "info";
    }

    setMsg(text);
    setKind(k);
    setOpen(true);

    // Remove the param so refresh doesn't replay the toast
    const sp = new URLSearchParams(searchParams);
    sp.delete("toast");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    // Auto-hide after 3.5s
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 3500);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname, searchParams, router]);

  if (!open) return null;

  const color =
    kind === "success"
      ? "bg-emerald-500 text-black"
      : kind === "error"
      ? "bg-red-500 text-black"
      : "bg-neutral-200 text-black";

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center pointer-events-none">
      <div className="pointer-events-auto ui-card px-4 py-3 flex items-center gap-3 shadow-lg border border-white/10 bg-neutral-900/90 backdrop-blur">
        <span
          className={
            "inline-flex h-2.5 w-2.5 rounded-full " +
            (kind === "success"
              ? "bg-emerald-400"
              : kind === "error"
              ? "bg-red-400"
              : "bg-amber-300")
          }
          aria-hidden
        />
        <div className="text-sm">{msg}</div>
        <button
          onClick={() => setOpen(false)}
          className="ml-2 rounded-md px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}