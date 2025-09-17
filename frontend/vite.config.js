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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    // Aumenta el límite de advertencia para el tamaño de los chunks a 1500 kB.
    chunkSizeWarningLimit: 1500,
    // --- FIN DE LA MODIFICACIÓN ---
  }
})