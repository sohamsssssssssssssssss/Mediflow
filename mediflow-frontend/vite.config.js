import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/extract': 'http://localhost:8000',
      '/extract-text': 'http://localhost:8000',
      '/timeline': 'http://localhost:8000',
      '/doctor-brief': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
