import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                // 在 Docker 环境中应使用 http://backend:8080
                // 在本地 npm run dev 环境中应使用 http://localhost:8080
                target: process.env.VITE_API_TARGET || 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        }
    }
})
