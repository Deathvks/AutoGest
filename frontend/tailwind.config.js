/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  // --- AÑADE EL PLUGIN AQUÍ ---
  plugins: [
    require('@tailwindcss/forms'),
  ],
}