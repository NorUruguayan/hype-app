import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#07142F',   // page background
          blue: '#3FA1FF',   // start of gradient
          purple: '#8E59FF', // end of gradient
          ink: '#0A1B3E',    // headings on light
        },
      },
      boxShadow: {
        brand: '0 10px 30px rgba(63,161,255,0.20)', // glow-ish
      },
    },
  },
  plugins: [],
}
export default config