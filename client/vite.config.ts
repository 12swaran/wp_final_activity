import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000', '/sitemap.xml': 'http://localhost:5000', '/robots.txt': 'http://localhost:5000' } },
})
