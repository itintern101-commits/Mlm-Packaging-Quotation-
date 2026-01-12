import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Mlm-Packaging-Quotation-/',
  server: {
    allowedHosts: [
      'myfrontend.loca.lt',
      '.loca.lt' // Allow ALL LocalTunnel domains
    ],
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}) 