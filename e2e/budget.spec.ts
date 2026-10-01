import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { expect } from '@playwright/test'
import { test } from './fixtures.ts'

// The JavaScript budget (#54): every .js file the production build ships
// under dist/client/assets/, gzipped, must total at most 85 KB. The build
// is the one npm run preview made before the run (playwright.config.ts).
// Runs once, in the chromium project.

const BUDGET = 85 * 1024 // 87,040 bytes
const ASSETS = new URL('../dist/client/assets/', import.meta.url)

test('the built JavaScript is at most 85 KB gzipped', () => {
  const files = readdirSync(ASSETS).filter((name) => name.endsWith('.js'))
  expect(files.length, 'built .js files').toBeGreaterThan(0)

  const sizes = files.map((name) => ({
    name,
    gzipped: gzipSync(readFileSync(new URL(name, ASSETS))).length,
  }))
  const total = sizes.reduce((sum, { gzipped }) => sum + gzipped, 0)
  const detail = sizes.map(({ name, gzipped }) => `${name}: ${gzipped} bytes`).join(', ')

  expect(
    total,
    `gzipped JavaScript is ${total} bytes (${detail}); the budget is ${BUDGET} bytes`,
  ).toBeLessThanOrEqual(BUDGET)
})
