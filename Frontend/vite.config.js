import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],

    server: {
      port: 5173,
      // ✅ Proxy ONLY in development
      proxy: mode === 'development'
        ? {
            '/api': {
              target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path
            }
          }
        : undefined
    },

    // ✅ Build optimizations
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@emotion/react', '@emotion/styled']
          }
        }
      }
    },

    // ✅ Preview server config (for testing production builds locally)
    preview: {
      port: 4173
    }
  };
});