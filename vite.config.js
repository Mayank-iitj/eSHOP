import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['gsap']
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})