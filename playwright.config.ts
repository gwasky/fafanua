import { defineConfig, devices } from '@playwright/test'
import { HEIGHT, WIDTHS } from './e2e/fixtures.ts'

// The port vite preview serves on. npm run preview builds the site and
// runs it on the Workers runtime, so the specs test the production build.
const PORT = 4173
const LOCAL_URL = `http://localhost:${PORT}`

// Set BASE_URL to run the specs against a site that is already running,
// such as a Cloudflare preview URL (#19). Playwright then starts no server.
const BASE_URL = process.env.BASE_URL || LOCAL_URL

// The chromium project runs the specs that set their own viewport, or
// need no particular one, once each. The width projects run only
// responsive.spec.ts, each at its own width with reduced motion, so
// in-page links jump instantly. Playwright loads a spec once for every
// project, so responsive.spec.ts declares its tests for every width, with
// the width at the end of the title, and each project picks its own with
// grep.
//
// The webkit-width projects run responsive.spec.ts the same way in
// Playwright's WebKit, Safari's engine, and the webkit project runs
// links.spec.ts, so layout, navigation and anchor problems that only
// show up in Safari are caught too. The webkit project now runs the
// keyboard and Menu toggle specs as well (#46), so Tab order, focus rings
// and the Menu toggle are checked in Safari's engine, and the header over
// an overlay section (header-overlay.spec.ts, #54), and a cold load of
// every section's hash (hash-landing.spec.ts, #62), and the motion layer
// and its safety rules (motion.spec.ts, #61). They use the Desktop
// Safari preset with its deviceScaleFactor of 2: assertions are in CSS
// pixels, so only the screenshot size changes. The a11y, italics, fonts,
// hash and forced-colours logo specs run in chromium only, as Playwright
// emulates forced colours only there.
// WebKit is installed with npx playwright install webkit.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'line' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: 'responsive.spec.ts',
    },
    ...WIDTHS.map((width) => ({
      name: `width-${width}`,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width, height: HEIGHT },
        reducedMotion: 'reduce' as const,
      },
      testMatch: 'responsive.spec.ts',
      grep: new RegExp(` at ${width}px$`),
    })),
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: [
        'links.spec.ts',
        'keyboard.spec.ts',
        'menu-toggle.spec.ts',
        'header-overlay.spec.ts',
        'hash-landing.spec.ts',
        'motion.spec.ts',
      ],
    },
    ...WIDTHS.map((width) => ({
      name: `webkit-width-${width}`,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width, height: HEIGHT },
        reducedMotion: 'reduce' as const,
      },
      testMatch: 'responsive.spec.ts',
      grep: new RegExp(` at ${width}px$`),
    })),
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run preview',
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
        // The first run builds the site before the preview starts.
        timeout: 180_000,
      },
})
