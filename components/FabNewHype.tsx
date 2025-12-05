"use client";

import Link from "next/link";
import { useState } from "react";

export default function FabNewHype() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  return (
    <div className="md:hidden fixed right-4 bottom-20 z-50">
      <Link
        href="/daily"
        className="relative btn btn-cta rounded-full px-4 py-3 text-sm font-semibold"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setRipples((prev) => [
            ...prev,
            {
              id: Date.now(),
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            },
          ]);
          setTimeout(() => setRipples((p) => p.slice(1)), 450);
        }}
        aria-label="Start a new Daily Hype"
      >
        <span className="relative z-10">+ Daily Hype</span>
        {/* ripple layer */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ui-ripple absolute"
            style={{
              left: r.x - 16,
              top: r.y - 16,
              width: 32,
              height: 32,
            }}
          />
        ))}
      </Link>
    </div>
  );
}