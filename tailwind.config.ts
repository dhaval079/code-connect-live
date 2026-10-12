import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f7f6f2",
        "paper-2": "#efede6",
        surface: "#ffffff",
        ink: "#0a0f1e",
        "ink-2": "#2a2e3a",
        muted: "#6b7280",
        subtle: "#9ca3af",
        "cyan-ink": "#0e7490",
        violet: "#8b5cf6",
        rose: "#e11d48",
        amber: "#f59e0b",
        line: "rgba(10,15,30,0.08)",
        "line-2": "rgba(10,15,30,0.14)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "Menlo", "monospace"],
        serif: ["var(--font-instrument)", "'Times New Roman'", "serif"],
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "20px",
        pill: "9999px",
      },
      boxShadow: {
        "1": "0 1px 0 rgba(10,15,30,0.04), 0 1px 2px rgba(10,15,30,0.04)",
        "2": "0 10px 30px -12px rgba(10,15,30,0.12), 0 2px 6px rgba(10,15,30,0.04)",
        "3": "0 30px 60px -24px rgba(10,15,30,0.18), 0 6px 14px rgba(10,15,30,0.05)",
      },
      maxWidth: {
        "8xl": "1280px",
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        blink: "blink 1s steps(2) infinite",
        spin: "spin 15s linear infinite",
        pulse: "pulse-ring 2.5s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
        bounce: "bounce-dot 1.4s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        blink: {
          "50%": { opacity: "0" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.9)" },
          "50%": { opacity: "0.9", transform: "scale(1.15)" },
        },
        "pulse-dot": {
          "50%": { opacity: "0.35" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { opacity: "0.3", transform: "translateY(0)" },
          "40%": { opacity: "1", transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
