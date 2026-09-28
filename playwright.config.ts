import { defineConfig, devices } from '@playwright/test'

// The port vite preview serves on. npm run preview builds the site and
// runs it on the Workers runtime, so the specs test the production build.
const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

// One Chromium project. The specs in e2e/ set their own viewport widths,
// so there are no per-width projects here (issue #16 adds those, limited
// to its own specs).
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
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // The first run builds the site before the preview starts.
    timeout: 180_000,
  },
})
