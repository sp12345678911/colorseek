import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: '/',
    build: {
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), 'index.html'),
          booking: resolve(process.cwd(), 'booking.html'),
        },
      },
    },
    server: {
      allowedHosts: true,
      proxy: {
        '/api': {
          target: env.DEV_API_PROXY_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
