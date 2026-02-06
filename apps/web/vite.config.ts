import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:4080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
