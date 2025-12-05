"use client";

import { useEffect } from "react";

export default function HypeBurst({ when }: { when: boolean }) {
  useEffect(() => {
    if (!when || typeof window === "undefined") return;

    const root = document.createElement("div");
    root.style.cssText = "pointer-events:none;position:fixed;inset:0;z-index:50";
    document.body.appendChild(root);

    const N = 70;
    for (let i = 0; i < N; i++) {
      const s = document.createElement("span");
      const x = Math.random() * 100;
      const d = 800 + Math.random() * 900;
      const rot = Math.random() * 360;
      s.style.cssText = `
        position:absolute;left:${x}vw;top:-2vh;width:6px;height:12px;
        background:linear-gradient(180deg,var(--accent-1),var(--accent-2));
        transform:rotate(${rot}deg);border-radius:2px;opacity:.95;
      `;
      root.appendChild(s);
      s.animate(
        [
          { transform: `translateY(0) rotate(${rot}deg)`, opacity: 1 },
          { transform: `translateY(105vh) rotate(${rot + 220}deg)`, opacity: 0.85 },
        ],
        { duration: d, easing: "cubic-bezier(.2,.9,.2,1)" }
      ).onfinish = () => s.remove();
    }

    const t = setTimeout(() => root.remove(), 2000);
    return () => clearTimeout(t);
  }, [when]);

  return null;
}