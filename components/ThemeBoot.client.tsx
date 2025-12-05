// components/ThemeBoot.client.tsx
"use client";

import { useEffect } from "react";

export default function ThemeBoot() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme"); // 'light' | 'dark' | 'system'
      if (!saved) {
        // Default to light for a friendlier first impression
        localStorage.setItem("theme", "light");
        document.documentElement.dataset.theme = "light";
      } else if (saved === "dark") {
        document.documentElement.dataset.theme = "dark";
      } else if (saved === "light") {
        document.documentElement.dataset.theme = "light";
      } else {
        // system
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
      }
    } catch {}
  }, []);
  return null;
}