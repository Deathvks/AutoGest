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
  build: {
    rollupOptions: {
      output: {
        // --- INICIO DE LA MODIFICACIÓN ---
        manualChunks(id) {
          // Agrupa todas las dependencias de node_modules en un único chunk "vendor".
          // Esto es más estable que intentar separar librerías interdependientes como React.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
        // --- FIN DE LA MODIFICACIÓN ---
      }
    }
  }
})