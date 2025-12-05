"use client";
import { useEffect } from "react";

/**
 * Sets body[data-page] so your globals.css route themes apply.
 * Usage: <PageTheme name="sunrise" /> (login), "peach" (daily),
 * "coral" (notifications), "sand" (settings), "teal" (feed/discover/invite).
 */
export default function PageTheme({ name = "default" }: { name?:
  "sunrise" | "peach" | "coral" | "sand" | "teal" | "default" }) {
  useEffect(() => {
    const prev = document.body.getAttribute("data-page");
    document.body.setAttribute("data-page", name);
    return () => {
      // only reset if we still own it
      if (document.body.getAttribute("data-page") === name) {
        document.body.setAttribute("data-page", "default");
      }
    };
  }, [name]);
  return null;
}