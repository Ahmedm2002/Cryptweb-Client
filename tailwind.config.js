import { theme } from "./src/theme/theme.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: theme.breakpoints,
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        tertiary: theme.colors.tertiary,
        error: theme.colors.error,
        background: theme.colors.background,
        surface: theme.colors.surface,
        outline: theme.colors.outline,
      },
      fontFamily: {
        headline: theme.typography.fonts.headline,
        body: theme.typography.fonts.body,
        label: theme.typography.fonts.label,
        mono: theme.typography.fonts.mono,
      },
      borderRadius: theme.radii,
      boxShadow: theme.shadows,
      animation: {
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
