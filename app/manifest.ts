// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HYPED",
    short_name: "HYPED",
    description: "Get hyped by your friends — share daily hype and join groups.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Adaptive / maskable icon for Android
      { src: "/logo.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New Daily Hype", short_name: "New Hype", url: "/daily" },
      { name: "Discover", short_name: "Discover", url: "/discover" },
    ],
  };
}