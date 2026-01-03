import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    port: 5173,

    // ✅ Proxy ONLY in development
    proxy: mode === 'development'
      ? {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            secure: false
          }
        }
      : undefined
  }
}));
