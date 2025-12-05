// tailwind.config.ts
import type { Config } from "tailwindcss";

const config = {
  darkMode: "class", // ✅ not ["class"]
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFCC00",
          orange: "#FFA800",
          red:    "#FF3D00",
        },
        // optional palette helpers
        sunrise: "#F4C56A",
        peach:   "#FFCF6E",
        coral:   "#E96E4C",
        teal:    "#0E6964",
        sand:    "#F6D99E",
      },
      boxShadow: {
        cta: "0 8px 24px rgba(255, 170, 0, 0.35)",
        glow: "0 10px 30px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        pill: "9999px",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, var(--brand-1) 0%, var(--brand-2) 55%, var(--brand-3) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;