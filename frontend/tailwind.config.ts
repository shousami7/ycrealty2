import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#1a1a1a",
        surface: "#242424",
        border: "#333333",
        accent: "#3b82f6",
      },
    },
  },
  plugins: [],
} satisfies Config;
