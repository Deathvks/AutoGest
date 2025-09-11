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
      
      // Opcional: También puedes redirigir la API aquí si quieres
      // '/api': 'http://localhost:3001',
    }
  },
  // --- INICIO DE LA MODIFICACIÓN ---
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separa las librerías más pesadas en sus propios ficheros (chunks)
          if (id.includes('node_modules')) {
            if (id.includes('jspdf')) {
              return 'vendor_jspdf';
            }
            if (id.includes('chart.js')) {
              return 'vendor_chartjs';
            }
            if (id.includes('html2canvas')) {
              return 'vendor_html2canvas';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor_react';
            }
            // Agrupa el resto de vendors en un chunk común
            return 'vendor_others';
          }
        }
      }
    }
  }
  // --- FIN DE LA MODIFICACIÓN ---
})