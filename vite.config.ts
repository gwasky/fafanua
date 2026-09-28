import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// The Inter woff2 imported by src/styles/fonts.css. Its built name is
// hashed, so a static preload link in index.html cannot point at it.
export const FONT_FILE = /(^|\/)inter-latin-wght-normal-[\w-]+\.woff2$/

/**
 * Preloads the Inter font in the production build, so the browser fetches
 * it alongside the stylesheet instead of after parsing it. crossorigin is
 * required: fonts are always fetched in CORS mode, and without it the
 * preload is not reused and the font downloads twice. The dev server
 * skips the preload.
 */
export function preloadFont(): Plugin {
  let base = '/'
  return {
    name: 'fafanua:preload-font',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const fonts = Object.keys(ctx.bundle ?? {}).filter((file) =>
          FONT_FILE.test(file),
        )
        if (fonts.length !== 1) {
          throw new Error(
            `Expected one Inter woff2 in the bundle, found ${fonts.length}`,
          )
        }
        // Straight after <title>, so it stays below the charset and
        // viewport meta tags and above the script and stylesheet Vite
        // injects.
        const link = `<link rel="preload" href="${base}${fonts[0]}" as="font" type="font/woff2" crossorigin>`
        if (!html.includes('</title>')) {
          throw new Error('index.html has no <title> to place the preload after')
        }
        return html.replace('</title>', `</title>\n    ${link}`)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // The Cloudflare plugin runs on the Workers runtime, which clashes with
  // Vitest's jsdom environment, so it is left out under test.
  plugins: [
    react(),
    preloadFont(),
    ...(process.env.VITEST ? [] : [cloudflare()]),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
