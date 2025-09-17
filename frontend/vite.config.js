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
        // Se revierte a una estrategia más simple y estable para evitar errores de dependencias.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
        // --- FIN DE LA MODIFICACIÓN ---
      }
    }
  }
})