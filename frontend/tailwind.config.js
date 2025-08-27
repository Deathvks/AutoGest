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
      // Definimos nuestros colores personalizados para el tema
      colors: {
        background: 'var(--color-background)',
        'component-bg': 'var(--color-component-bg)',
        'component-bg-hover': 'var(--color-component-bg-hover)', // Nuevo color para el hover de componentes
        'border-color': 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'blue-accent': 'var(--color-blue-accent)', // Azul vibrante para acentos
        'red-accent': 'var(--color-red-accent)',   // Rojo para peligro
        'green-accent': 'var(--color-green-accent)', // Verde para éxito/disponible
        'yellow-accent': 'var(--color-yellow-accent)', // Amarillo para reservado/advertencia
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}