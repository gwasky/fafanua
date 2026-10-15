import { expect, type Page } from '@playwright/test'
import { test, waitForFonts } from './fixtures.ts'

// With only the web font stalled, the homepage paints in the "Inter
// Fallback" face well before the font arrives, in Chromium and WebKit
// (#84). Under font-display: swap, WebKit painted nothing until the
// preloaded font arrived: text in a font that is still loading does not
// count towards its first paint, and since the open grid (#83) the page
// has too few image or SVG pixels to count instead. Under fallback, the
// 100ms block period ends with a layout in the fallback face, which does
// count. Runs in the chromium and webkit projects.

const HEADING = 'Trusted Data. Better Decisions.'
const PROMISE = 'Build a data foundation you can trust.'

/** The statuses of the "Inter Variable" FontFace objects on the page. */
const interStatuses = (page: Page) =>
  page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.family.replace(/^["']|["']$/g, '') === 'Inter Variable')
      .map((face) => face.status),
  )

for (const width of [360, 1440] as const) {
  test(`the homepage paints in the fallback face while the font is held, at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    // WebKit runs no animation frame before its first paint, so the first
    // frame's time is a second view of when the page first painted.
    await page.addInitScript(() => {
      const w = window as { __firstFrame?: number }
      requestAnimationFrame(() => (w.__firstFrame = performance.now()))
    })

    // Hold every woff2 request, and nothing else, until release(). A
    // guard releases it 2s after the first request at the latest.
    let held = true
    let requestedAt: number | undefined
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = () => {
        held = false
        resolve()
      }
    })
    await page.route(/\.woff2$/, async (route) => {
      if (requestedAt === undefined) {
        requestedAt = Date.now()
        setTimeout(release, 2_000)
      }
      await gate
      await route.continue()
    })

    try {
      // The load event would wait for the held font.
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      // Wait for a paint entry while the font is held: up to 2s, ending
      // before the guard releases the font, so a page that paints only
      // when the font arrives times out here.
      expect(requestedAt, 'the woff2 was requested').toBeDefined()
      const timeout = Math.min(2_000, requestedAt! + 1_900 - Date.now())
      const fcp = await page
        .waitForFunction(
          () => performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          undefined,
          { timeout, polling: 50 },
        )
        .then((handle) => handle.jsonValue() as Promise<number>)
      expect(fcp, 'first-contentful-paint, in ms').toBeLessThan(1_000)
      expect(
        await page.evaluate(() => (window as { __firstFrame?: number }).__firstFrame),
        'first animation frame',
      ).toBeDefined()

      // Still held, so the painted text can only be in the fallback face.
      // WebKit reports the waiting FontFace as "error", not "loading".
      expect(held, 'font still held').toBe(true)
      expect(await page.evaluate(() => document.fonts.status)).toBe('loading')
      expect(await interStatuses(page)).not.toContain('loaded')

      const heading = page.getByRole('heading', { level: 1, name: HEADING })
      const promise = page.getByText(PROMISE, { exact: true })
      for (const element of [heading, promise]) {
        await expect(element).toBeVisible()
        await expect(element).toBeInViewport()
      }
      expect(held, 'font still held after the checks').toBe(true)
    } finally {
      release()
    }

    // Released within the swap period, so Inter is swapped in.
    await waitForFonts(page)
  })
}
