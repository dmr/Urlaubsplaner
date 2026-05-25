/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#162820",
        "forest-deep": "#0c1812",
        moss: "#5a7f4b",
        "moss-soft": "#8aa57a",
        cream: "#f3ead7",
        "cream-soft": "#e8dec7",
        parchment: "#fbf5e6",
        amber: {
          DEFAULT: "#c98a3a",
          deep: "#9c6420",
        },
        stone: "#3a3d38",
        ink: "#1a1f1c",
        rust: "#a14a2a",
        blood: "#7d1f1f",
      },
      fontFamily: {
        serif: ["Fraunces", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
