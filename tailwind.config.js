/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{tsx,ts,jsx,js}",
    "./components/**/*.{tsx,ts,jsx,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
