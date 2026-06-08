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
            // Heavy, narrowly-used libs → own chunks so they load only with the
            // pages that need them (and stay cached across page chunks).
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'quill';
            }
            if (id.includes('@dnd-kit')) {
              return 'dnd';
            }
            if (id.includes('sweetalert2')) {
              return 'sweetalert';
            }
            if (id.includes('framer-motion')) {
              return 'framer';
            }
            if (id.includes('react-redux') || id.includes('@reduxjs/toolkit')) {
              return 'redux';
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'ui';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
