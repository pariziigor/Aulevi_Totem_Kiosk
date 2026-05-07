/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderWidth: {
        '16': '16px', // Necessário para as bordas agressivas do Brutalismo
      }
    },
  },
  plugins: [],
}