// autogest-app/frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Paleta de colores profesional
      colors: {
        background: 'var(--color-background)',
        'component-bg': 'var(--color-component-bg)',
        'component-bg-hover': 'var(--color-component-bg-hover)',
        'border-color': 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        
        // Color de acento principal (dorado/cobre)
        'accent': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',

        // Colores semánticos
        'green-accent': 'var(--color-green-accent)',
        'red-accent': 'var(--color-red-accent)',
        'yellow-accent': 'var(--color-yellow-accent)',
        'blue-accent': 'var(--color-blue-accent)', // Se renombra pero se mantiene por si se usa para elementos informativos
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}