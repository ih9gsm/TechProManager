import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Importa il modulo path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias per src
      '@shared': path.resolve(__dirname, '../shared'), // Alias per shared
    },
  },
  server: { // Aggiungi la configurazione del server
    port: 5173,
    cors: true,
    hmr: {
      overlay: true,
    },
    proxy: {
      // Proxy delle richieste /api al backend su localhost:3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true, // Necessario per i virtual host
        // rewrite: (path) => path.replace(/^\/api/, '') // Rimuovi /api se il backend non lo usa come prefisso
      }
    }
  }
});