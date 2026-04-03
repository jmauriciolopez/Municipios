import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Carga las variables del .env en base al modo (development, production)
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  const port = Number(env.VITE_APP_PORT || 5173)
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000'

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    server: {
      port,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          // If apiUrl includes /api/v1, this rewrite keeps paths correct:
          // /api/points -> /api/v1/points
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    define: {
      'process.env': {
        VITE_APP_PORT: env.VITE_APP_PORT,
        VITE_API_URL: env.VITE_API_URL,
      },
    },
  }
})