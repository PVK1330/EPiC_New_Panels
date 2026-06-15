import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ── Dev server ──────────────────────────────────────────────────────────────
  // Proxy /api and /socket.io to the Express server so the browser sees both
  // the frontend and the API on the SAME origin (no cross-origin cookie issues
  // for JWT or CSRF cookies regardless of which subdomain the tenant is on).
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },

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
