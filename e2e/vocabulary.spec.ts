import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect } from '@playwright/test'
import { aboutParagraph } from '../src/data/about.ts'
import {
  futureReadyDestination,
  futureReadyHeading,
  futureReadyLabels,
  futureReadyStatement,
} from '../src/data/futureReady.ts'
import { systemFlow } from '../src/data/systemFlow.ts'
import { openPage, scrollThrough, test } from './fixtures.ts'

// The AI-readiness copy and vocabulary pass (#72, W5 and W6 in
// _docs/fafanua-trust-lineage-positioning-plan.md). The build is the one
// npm run preview made before the run (playwright.config.ts). Runs in the
// chromium project.

const CLIENT = fileURLToPath(new URL('../dist/client/', import.meta.url))
const RETIRED = [/provenance/i, /data operating system/i]

/** Every file under a directory, recursively. */
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

test('the built site (HTML and JavaScript) has no "provenance" and no "data operating system" (W6)', () => {
  const built = files(CLIENT).filter((path) => /\.(html|js)$/.test(path))
  expect(built.some((path) => path.endsWith('index.html')), 'built HTML').toBe(true)
  expect(built.some((path) => path.endsWith('.js')), 'built JavaScript').toBe(true)

  for (const path of built) {
    const text = readFileSync(path, 'utf8')
    for (const word of RETIRED) {
      expect(text, `${path.slice(CLIENT.length)} says ${word}`).not.toMatch(word)
    }
  }
  // The new wording did reach the bundle.
  const js = built.filter((path) => path.endsWith('.js')).map((path) => readFileSync(path, 'utf8')).join('\n')
  expect(js).toContain(systemFlow.heading)
  expect(js).toContain('organisations in Africa')
})

test('the rendered homepage says neither "provenance" nor "data operating system" (W6)', async ({ page }) => {
  await openPage(page, 1440)
  await scrollThrough(page)
  const text = await page.locator('body').innerText()

  for (const word of RETIRED) expect(text).not.toMatch(word)
  expect(text).not.toMatch(/African organisations/i)
  await expect(page.getByRole('heading', { level: 3, name: systemFlow.heading })).toBeVisible()
  await expect(page.getByText(aboutParagraph)).toBeVisible()
  // The protected hero positioning is unchanged.
  await expect(page.getByRole('heading', { level: 1, name: 'Trusted Data. Better Decisions.' })).toBeVisible()
  await expect(page.getByText('Build a data foundation you can trust.', { exact: true })).toBeVisible()
})

test('the future-ready graphic is exposed: a list named by the heading, then the destination (W5)', async ({ page }) => {
  await openPage(page, 1440)
  const section = page.getByRole('region', { name: futureReadyHeading })
  await section.scrollIntoViewIfNeeded()
  await expect(section).toBeInViewport()

  expect(await section.ariaSnapshot()).toBe(
    [
      `- region "${futureReadyHeading}":`,
      `  - heading "${futureReadyHeading}" [level=2]`,
      // Quoted, as the paragraph has colons.
      `  - paragraph: ${JSON.stringify(futureReadyStatement)}`,
      `  - list "${futureReadyHeading}":`,
      ...futureReadyLabels.map((label) => `    - listitem: ${label}`),
      `  - text: ${futureReadyDestination}`,
    ].join('\n'),
  )
  // No link, button or other tab stop.
  expect(await section.locator('a, button, input, select, textarea, [tabindex]').count()).toBe(0)
})
