import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-redux') || id.includes('@reduxjs/toolkit')) {
              return 'redux';
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'ui';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
