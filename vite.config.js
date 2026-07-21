import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/colorseek/', // ✨ 這行最重要，解決 GitHub Pages 部署後的白畫面問題
  server: {
    allowedHosts: true, // 保持全開放行
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
