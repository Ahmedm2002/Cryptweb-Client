// Central Design System Configuration (Light Mode, Elite, Professional)

export const theme = {
  colors: {
    // Primary: Smooth, vibrant purple
    primary: {
      DEFAULT: "#6b4ce6", // Darkened slightly to guarantee AAA contrast with white
      container: "#4a35a8", // Darkened for gradient end so white text passes WCAG
      "on-primary": "#ffffff",
      "on-container": "#e5dfff",
    },
    // Secondary: Professional Teal/Cyan
    secondary: {
      DEFAULT: "#0891b2",
      container: "#cffafe",
      "on-secondary": "#ffffff",
      "on-container": "#164e63",
    },
    // Tertiary: Refined Rose/Coral
    tertiary: {
      DEFAULT: "#e11d48",
      container: "#ffe4e6",
      "on-tertiary": "#ffffff",
      "on-container": "#9f1239",
    },
    // Error
    error: {
      DEFAULT: "#ef4444",
      container: "#fef2f2",
      "on-error": "#ffffff",
      "on-container": "#991b1b",
    },
    // Surfaces & Backgrounds: Crisp Whites with subtle cool undertones
    background: {
      DEFAULT: "#fafbff",
      on: "#1a1a2e",
    },
    surface: {
      DEFAULT: "#ffffff",
      dim: "#f3f4f6",
      bright: "#ffffff",
      "container-lowest": "#ffffff",
      low: "#f9fafb",
      container: "#f3f4f6",
      high: "#e5e7eb",
      highest: "#d1d5db",
      "on-surface": "#0f172a", // Darkened for max contrast against white
      variant: "#334155", // WCAG AA text contrast on white surface
      "on-variant": "#1e293b",
    },
    // Borders
    outline: {
      DEFAULT: "#d1d5db",
      variant: "#e5e7eb",
    },
  },
  typography: {
    fonts: {
      headline: ["Inter", "sans-serif"],
      body: ["Inter", "sans-serif"],
      label: ["Inter", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
  },
  spacing: {
    // We rely on Tailwind's default spacing for padding/margin (mapped in config),
    // but define specific container and layout sizes here if needed.
    container: {
      max: "1440px",
      hero: "1280px", // max-w-7xl
      prose: "1024px", // max-w-5xl
    },
  },
  radii: {
    DEFAULT: "0.25rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    "4xl": "2rem",
    full: "9999px",
  },
  shadows: {
    // Soft, elite modern diffuse shadows for cards
    card: "0 8px 30px rgba(0, 0, 0, 0.04)",
    "card-hover": "0 12px 40px rgba(0, 0, 0, 0.08)",
    button: "0 4px 14px rgba(124, 92, 252, 0.25)",
    "button-hover": "0 6px 20px rgba(124, 92, 252, 0.35)",
    glass: "0 8px 32px rgba(0, 0, 0, 0.06)",
    floating: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
  },
  breakpoints: {
    sm: "640px", // Mobile
    md: "768px", // Tablet
    lg: "1024px", // Desktop
    xl: "1280px", // Large Desktop
  },
};
