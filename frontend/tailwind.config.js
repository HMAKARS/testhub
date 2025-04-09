/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Apple SD Gothic Neo"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#f9fafb',
      },
    },
  },


  plugins: [],
}
