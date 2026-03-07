import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff6b00",
          50: "#fff4ed",
          100: "#ffe6d5",
          200: "#ffccaa",
          300: "#ffa870",
          400: "#ff7d37",
          500: "#ff6b00",
          600: "#f04f00",
          700: "#c73a02",
          800: "#9e2f0a",
          900: "#7f2a0b",
        },
      },
    },
  },
  plugins: [],
};
export default config;

