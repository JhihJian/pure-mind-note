import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig as defineVitestConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
