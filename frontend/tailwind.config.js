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
      colors: {
        background: 'var(--color-background)',
        'component-bg': 'var(--color-component-bg)',
        'component-bg-hover': 'var(--color-component-bg-hover)',
        'border-color': 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        
        'accent': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',

        'green-accent': 'var(--color-green-accent)',
        'red-accent': 'var(--color-red-accent)',
        'yellow-accent': 'var(--color-yellow-accent)',
        'blue-accent': 'var(--color-blue-accent)',
        
        'popup-bg': 'var(--color-popup-bg)', // <-- AÑADIDO
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      keyframes: {
        glow: {
          '0%, 100%': { borderColor: 'var(--color-border)' },
          '50%': { borderColor: 'var(--color-accent)' },
        }
      },
      animation: {
        'ring-glow': 'glow 3s linear infinite',
      }
    },
  },
  plugins: [],
}