/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       colors: {
        navy: {
          900: '#0F1629',
          800: '#161E35',
          700: '#1E2847',
        },
        violet: {
          500: '#7C6FFF',
        }
      }
    },
  },
  plugins: [],
}

