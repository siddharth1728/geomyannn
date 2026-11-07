import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/domain/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-elevated": "var(--surface-elevated)",
        "surface-muted": "var(--surface-muted)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
        },
        secondary: "var(--secondary)",
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        success: "var(--success)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Menlo", "Consolas", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        card: "0 4px 14px 0 rgba(0,0,0,0.06)",
        float: "0 12px 32px -4px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
