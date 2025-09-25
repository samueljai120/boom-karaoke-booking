import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Generate a unique build ID for cache busting
const buildId = Date.now()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // No proxy configuration for standalone frontend
  },
  preview: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // DnD Kit libraries
          if (id.includes('@dnd-kit')) {
            return 'dnd-kit';
          }
          
          // Date/time libraries
          if (id.includes('moment')) {
            return 'moment';
          }
          
          // HTTP client
          if (id.includes('axios')) {
            return 'axios';
          }
          
          // Query libraries
          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }
          
          // UI components
          if (id.includes('lucide-react') || id.includes('framer-motion')) {
            return 'ui-libs';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'forms';
          }
          
          // Toast notifications
          if (id.includes('react-hot-toast')) {
            return 'notifications';
          }
          
          // Socket.io
          if (id.includes('socket.io')) {
            return 'socket';
          }
          
          // Utility libraries
          if (id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'utils';
          }
          
          // Large components - split into separate chunks
          if (id.includes('AppleCalendarDashboard')) {
            return 'calendar-dashboard';
          }
          
          if (id.includes('BookingModal') || id.includes('ReservationViewModal')) {
            return 'booking-modals';
          }
          
          if (id.includes('TraditionalSchedule')) {
            return 'traditional-schedule';
          }
          
          // API and contexts
          if (id.includes('/lib/api') || id.includes('/contexts/')) {
            return 'api-contexts';
          }
          
          // If no specific chunk matches, use default
          return null;
        },
        // Add build ID and hash to filenames for cache busting
        entryFileNames: `assets/[name]-${buildId}-[hash].js`,
        chunkFileNames: `assets/[name]-${buildId}-[hash].js`,
        assetFileNames: `assets/[name]-${buildId}-[hash].[ext]`
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  define: {
    global: 'globalThis',
    'process.env': 'process.env',
  },
  optimizeDeps: {
    include: ['axios', 'react', 'react-dom']
  }
})