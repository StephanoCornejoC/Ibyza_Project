import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias "@" apunta a src/ — facilita imports absolutos en todo el proyecto
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react-dom') ||
              id.includes('/react/') ||
              id.includes('react-router') ||
              id.includes('react-helmet')
            ) return 'vendor-react';
            if (id.includes('framer-motion') || id.includes('lenis')) return 'vendor-framer';
            if (
              id.includes('react-hook-form') ||
              id.includes('@hookform') ||
              id.includes('zod')
            ) return 'vendor-forms';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('styled-components')) return 'vendor-styled';
            if (id.includes('axios')) return 'vendor-axios';
            return 'vendor';
          }
        },
      },
    },
  },
});
