import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones de archivos estáticos al backend en desarrollo
      '/avatars': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
      '/documents': 'http://localhost:3001',
      '/expenses': 'http://localhost:3001',
    }
  },
  build: {
    rollupOptions: {
      output: {
        // --- INICIO DE LA MODIFICACIÓN ---
        // Estrategia de code-splitting más granular para optimizar el tamaño de los chunks.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('chart.js')) {
              return 'chart-vendor';
            }
            // Crea un chunk específico para la librería de iconos, que suele ser grande.
            if (id.includes('@fortawesome')) {
              return 'fontawesome-vendor';
            }
            // Agrupa otras librerías de UI.
            if (id.includes('@headlessui') || id.includes('@floating-ui')) {
              return 'ui-vendor';
            }
            // El resto de dependencias menos comunes irán al chunk por defecto.
            return 'vendor';
          }
        }
        // --- FIN DE LA MODIFICACIÓN ---
      }
    }
  }
})