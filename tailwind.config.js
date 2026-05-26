/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: "var(--c-forest)",
        "forest-deep": "var(--c-forest-deep)",
        moss: "var(--c-moss)",
        "moss-soft": "var(--c-moss-soft)",
        cream: "var(--c-cream)",
        "cream-soft": "var(--c-cream-soft)",
        parchment: "var(--c-parchment)",
        amber: {
          DEFAULT: "var(--c-amber)",
          deep: "var(--c-amber-deep)",
        },
        stone: "var(--c-stone)",
        ink: "var(--c-ink)",
        rust: "var(--c-rust)",
        blood: "var(--c-blood)",
      },
      fontFamily: {
        serif: ["Fraunces", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
