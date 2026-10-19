import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // The Tabler shell preview is a second HTML entry; the existing app stays at index.html.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        'tabler-preview': fileURLToPath(new URL('./tabler-preview.html', import.meta.url)),
      },
    },
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000,
  },
})
