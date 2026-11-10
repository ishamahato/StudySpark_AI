import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neu: {
          base: "var(--neu-base)",
          blue: "var(--neu-blue)",
          pink: "var(--neu-pink)",
          light: "var(--neu-light)",
          dark: "var(--neu-dark)",
          accent: "var(--neu-accent)",
          heading: "var(--neu-heading)",
          text: "var(--neu-text)",
        },
        canvas: {
          light: "#E8E8E8",
          dark: "#202125",
        },
        card: {
          light: "#E8E8E8",
          dark: "#202125",
        },
        brand: {
          DEFAULT: "#7B68EE",
          hover: "#6A55E5",
          active: "#5B44D8",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7B68EE",
          600: "#6A55E5",
          700: "#5B44D8",
          800: "#4C35BA",
          900: "#3E279A",
        },
        text: {
          main: "#3F3F46",
          muted: "#71717A",
          darkMain: "#F4F4F5",
          darkMuted: "#A1A1AA",
        },
        border: {
          light: "#D8D8D8",
          dark: "#2C2D32",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "-8px -8px 24px var(--neu-light), 8px 8px 24px var(--neu-dark)",
        elevated: "-12px -12px 32px var(--neu-light), 12px 12px 32px var(--neu-dark)",
        neu: "-8px -8px 24px var(--neu-light), 8px 8px 24px var(--neu-dark)",
        "neu-sm": "-4px -4px 12px var(--neu-light), 4px 4px 12px var(--neu-dark)",
        "neu-inset": "inset -4px -4px 10px var(--neu-light), inset 4px 4px 10px var(--neu-dark)",
        "neu-inset-sm": "inset -2px -2px 6px var(--neu-light), inset 2px 2px 6px var(--neu-dark)",
        "neu-chip": "-4px -4px 10px var(--neu-light), 4px 4px 10px var(--neu-dark)",
      },
      borderRadius: {
        card: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
