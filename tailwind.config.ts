import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        "surface-muted": "var(--surface-muted)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        border: "var(--border)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Menlo", "Consolas", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "mission-glow": "0 0 20px -3px rgba(117, 230, 194, 0.15)",
        "panel-glow": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
