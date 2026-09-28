/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Libre Baskerville"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'novell-dark': '#1e293b',
        'novell-gold': '#b59410',
      },
    },
  },
  plugins: [],
}
