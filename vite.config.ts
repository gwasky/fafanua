import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // The Cloudflare plugin runs on the Workers runtime, which clashes with
  // Vitest's jsdom environment, so it is left out under test.
  plugins: [react(), ...(process.env.VITEST ? [] : [cloudflare()])],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
