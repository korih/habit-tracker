import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark theme palette (GitHub dark inspired)
        dark: {
          bg: "#0d1117",
          surface: "#161b22",
          border: "#30363d",
          text: "#c9d1d9",
          muted: "#8b949e",
        },
        // Light theme palette
        light: {
          bg: "#ffffff",
          surface: "#f6f8fa",
          border: "#d0d7de",
          text: "#24292f",
          muted: "#57606a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
