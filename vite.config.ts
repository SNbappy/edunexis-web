import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({ babel: { plugins: [] } })],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    },
    proxy: {
      '/api': { target: 'http://localhost:5041', changeOrigin: true },
    },
  },
  optimizeDeps: {
    include: ['html2pdf.js'],
    exclude: ['@react-three/fiber', '@react-three/drei'],
  },
})

