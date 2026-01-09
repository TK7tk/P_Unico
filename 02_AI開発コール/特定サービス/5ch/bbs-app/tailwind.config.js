/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B78791",
          light: "#D4A8B0",
          dark: "#916C73",
        },
        secondary: "#F9E6DF",
        background: {
          DEFAULT: "#FFFFFF",
          light: "#FFF4F0",
        },
        foreground: "#1A1A1A",
        muted: "#666666",
        border: "#D4A8B0",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif)", "serif"],
        sans: ["var(--font-noto-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

