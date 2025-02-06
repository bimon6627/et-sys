import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "eo-orange": "var(--eo-orange)",
        "eo-lorange": "var(--eo-lorange)",
        "eo-blue": "var(--eo-blue)",
        "eo-yellow": "var(--eo-yellow)",
        "eo-lyellow": "var(--eo-lyellow)",
        "eo-green": "var(--eo-green)",
        "eo-lgreen": "var(--eo-lgreen)",
        "eo-gray": "var(--eo-gray)",
        "eo-white": "var(--eo-white)",
        "eo-lblue": "var(--eo-lblue)",
      },
    },
  },
  plugins: [],
} satisfies Config;
