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
        // Estrategia de code-splitting mejorada para reducir el tamaño del chunk vendor.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Agrupa React y sus librerías relacionadas en un chunk.
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) {
              return 'react-vendor';
            }
            // Agrupa la librería de gráficos (que es grande) en su propio chunk.
            if (id.includes('chart.js')) {
              return 'chart-vendor';
            }
            // El resto de dependencias irán a un chunk genérico.
            return 'vendor';
          }
        }
        // --- FIN DE LA MODIFICACIÓN ---
      }
    }
  }
})