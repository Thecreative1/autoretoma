import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F2F5F9",
          100: "#E3EAF3",
          200: "#C2D0E3",
          300: "#8FA6C8",
          400: "#5B7BAD",
          500: "#33538A",
          600: "#27416C",
          700: "#1E3355",
          800: "#16263F",
          900: "#0F1B2D",
          950: "#0A1220",
        },
        accent: {
          50: "#FFF4EC",
          100: "#FEEBDD",
          200: "#FBD3B4",
          300: "#F9B383",
          400: "#F98B4C",
          500: "#F26A1B",
          600: "#D95408",
          700: "#B44506",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-archivo)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem",
      },
      maxWidth: {
        site: "76rem",
      },
    },
  },
  plugins: [],
};

export default config;
