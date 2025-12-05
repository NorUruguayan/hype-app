// components/ToastProvider.client.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: "success" | "error" | "info";
  duration?: number; // ms
};

type Ctx = {
  show: (t: Omit<Toast, "id">) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setList((ls) => ls.filter((t) => t.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = {
      id,
      variant: "info",
      duration: 2800,
      ...t,
    };
    setList((ls) => [...ls, toast]);
    timers.current[id] = window.setTimeout(() => remove(id), toast.duration!);
  }, [remove]);

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((tid) => window.clearTimeout(tid));
      timers.current = {};
    };
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* viewport */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
        {list.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { variant = "info", title, message } = toast;
  const ring =
    variant === "success" ? "ring-emerald-400/30" :
    variant === "error"   ? "ring-red-400/30"     :
                            "ring-white/20";
  const bar =
    variant === "success" ? "from-emerald-400/80 to-emerald-300/70" :
    variant === "error"   ? "from-red-500/90 to-orange-400/80"      :
                            "from-white/80 to-white/60";

  return (
    <div className={`pointer-events-auto relative w-[320px] rounded-xl bg-neutral-900/90 ring-1 ${ring} backdrop-blur p-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)]`}>
      <div className={`absolute left-0 top-0 h-full w-[3px] rounded-l-xl bg-gradient-to-b ${bar}`} aria-hidden />
      <div className="pr-8">
        {title && <div className="text-sm font-semibold mb-0.5">{title}</div>}
        <div className="text-sm opacity-90">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-xs text-white/70 hover:bg-white/10"
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  );
}