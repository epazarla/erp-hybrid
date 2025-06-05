import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: '/erp/', // Alt dizin için base URL ayarı
  plugins: [
    react(),
    nodePolyfills({
      // MUI için gerekli polyfills
      include: ['buffer', 'process', 'util'],
    }),
  ],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // MUI için chunk boyut uyarılarını kaldır
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // MUI bileşenlerini ayrı chunk'lara ayır
      output: {
        manualChunks: {
          mui: ['@mui/material'],
          muiIcons: ['@mui/icons-material'],
        },
      },
    },
  },
  optimizeDeps: {
    // MUI için optimize edilmiş bağımlılıklar
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
});
