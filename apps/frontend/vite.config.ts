// A simplified version of the vite config to avoid ESM resolution issues
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), TanStackRouterVite(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@repo/shared-types': path.resolve(__dirname, '../../packages/shared-types'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true,
  },
  build: {
    commonjsOptions: { 
      transformMixedEsModules: true 
    }
  },
  // Improve compatibility with Docker/Node.js
  cacheDir: path.resolve(__dirname, './node_modules/.vite'),
})
