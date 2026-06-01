/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#093C5D',
        secondary: '#3B7597',
        accent: '#6FD1D7',
        cta: '#5DF8D8',
        cream: '#FDF8F0',
        dark: '#333333',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}