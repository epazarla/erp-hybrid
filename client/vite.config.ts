import { defineConfig } from 'vite';

export default defineConfig({
  base: '/erp/', // Alt dizin için base URL ayarı
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});
