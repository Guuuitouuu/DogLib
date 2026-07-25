import type { Config } from "tailwindcss";

/**
 * v0 export (dog-trainer-dashboard) has no tailwind.config — fonts are set via
 * `next/font` Inter (--font-inter) and `@theme` in src/app/globals.css.
 * This file mirrors the same fontFamily for tooling; Tailwind v4 reads fonts from CSS @theme.
 */
const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
