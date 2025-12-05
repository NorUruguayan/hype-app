// components/Providers.tsx
"use client";

import type { ReactNode } from "react";
import { ToastViewport } from "@/components/Toast";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}