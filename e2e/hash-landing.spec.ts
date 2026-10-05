import { expect, type Browser, type Page } from '@playwright/test'
import { expectLanded, test, waitForLanding } from './fixtures.ts'

// A cold load of every section's hash, and every other nav target, lands
// on it in Chromium and WebKit (#62): the section's top on the solid
// header's bottom edge, with its heading just below. It holds for single
// loads one after another and for 6 loads at once, with the CSS on time
// and delayed by 150 and 400 ms, at 360 and 1440px, under both motion
// settings. Runs in the chromium and webkit projects.
//
// Before #62, WebKit could run landOnHash before the stylesheet applied,
// and the font swap could then move the target with nothing to move it
// back: under 6 loads at once, /#managed-services missed in 10 of 30 runs
// at 360 and 24 of 30 at 1440 (#58 QA). Each load is a new browser
// context, and the tests only wait for the landing to settle
// (waitForLanding): nothing scrolls to the target again before the
// assertion.

const HASHES = [
  '#services',
  '#managed-services',
  '#solutions',
  '#how-we-work',
  '#future-ready',
  '#about',
  '#contact',
  // The skip link's and the logo's targets.
  '#main',
  '#top',
] as const

const WIDTHS = [360, 1440] as const
const MOTIONS = ['reduce', 'no-preference'] as const
const DELAYS = [0, 150, 400] as const

type Load = { width: number; motion: (typeof MOTIONS)[number]; delay: number }

/**
 * Opens a hash in a new context, with the CSS delayed, and waits for it
 * to land. Returns the page, its context and any console errors.
 */
async function coldLoad(browser: Browser, baseURL: string | undefined, load: Load, hash: string) {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: load.width, height: 800 },
    reducedMotion: load.motion,
  })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`)
  })
  if (load.delay > 0) {
    await page.route(/\.css$/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, load.delay))
      await route.continue()
    })
  }
  await page.goto(`/${hash}`)
  await waitForLanding(page, hash)
  return { page, context, errors }
}

/**
 * Expects the load to have landed on the hash. For a section, the header
 * is solid and the section's heading is in view just below it.
 */
async function expectHeadingBelowHeader(page: Page, hash: string, errors: string[]) {
  expect(errors, `console errors on /${hash}`).toEqual([])
  expect(await page.evaluate(() => location.hash)).toBe(hash)
  await expectLanded(page, hash)
  if (hash === '#top' || hash === '#main') return

  const metrics = await page.evaluate((id) => {
    const header = document.querySelector('header')!
    const heading = document.getElementById(`${id}-heading`)!
    return {
      solid: !header.classList.contains('on-dark'),
      headerBottom: header.getBoundingClientRect().bottom,
      headingTop: heading.getBoundingClientRect().top,
      headingBottom: heading.getBoundingClientRect().bottom,
      viewport: window.innerHeight,
    }
  }, hash.slice(1))
  const detail = `${hash}: ${JSON.stringify(metrics)}`
  expect(metrics.solid, detail).toBe(true)
  expect(metrics.headingTop, detail).toBeGreaterThan(metrics.headerBottom)
  expect(metrics.headingBottom, detail).toBeLessThanOrEqual(metrics.viewport)
}

for (const motion of MOTIONS) {
  test.describe(`cold loads with ${motion} motion`, () => {
    for (const width of WIDTHS) {
      for (const delay of DELAYS) {
        const css = delay ? `the CSS delayed ${delay}ms` : 'the CSS on time'
        const load = { width, motion, delay }

        test(`every hash lands, one load at a time, with ${css}, at ${width}px, ${motion}`, async ({
          browser,
          baseURL,
        }) => {
          test.setTimeout(60_000)
          for (const hash of HASHES) {
            await test.step(hash, async () => {
              const { page, context, errors } = await coldLoad(browser, baseURL, load, hash)
              try {
                await expectHeadingBelowHeader(page, hash, errors)
              } finally {
                await context.close()
              }
            })
          }
        })

        test(`every hash lands, 6 loads at a time, with ${css}, at ${width}px, ${motion}`, async ({
          browser,
          baseURL,
        }) => {
          test.setTimeout(60_000)
          // Two rounds of 6, so every hash is loaded at least once.
          const rounds = [HASHES.slice(0, 6), [...HASHES.slice(6), ...HASHES.slice(0, 3)]]
          for (const [index, round] of rounds.entries()) {
            const loads = await Promise.all(round.map((hash) => coldLoad(browser, baseURL, load, hash)))
            try {
              for (const [i, { page, errors }] of loads.entries()) {
                await test.step(`round ${index + 1}: ${round[i]}`, () =>
                  expectHeadingBelowHeader(page, round[i], errors),
                )
              }
            } finally {
              await Promise.all(loads.map(({ context }) => context.close()))
            }
          }
        })
      }
    }
  })
}

// The scroll landOnHash makes once the fonts have loaded must not pull a
// visitor back who has already moved away from the target, even when no
// wheel, touch, key or pointer event fired (#62): find-in-page, a screen
// reader, a scroll-to-text link or a scrollbar drag. Here the web font is
// held back, the hash lands in the fallback font, and the page then
// scrolls away in script, before the font arrives. Before the fix, the
// page jumped back to the target once the font loaded, 12 of 12 times
// (#62 QA).
for (const motion of MOTIONS) {
  for (const width of WIDTHS) {
    test(`a scroll away with no input event before the font loads is kept, at ${width}px, ${motion}`, async ({
      browser,
      baseURL,
    }) => {
      const hash = '#about'
      const away = 2000
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: 800 },
        reducedMotion: motion,
      })
      try {
        const page = await context.newPage()
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(`console.error: ${message.text()}`)
        })
        let release = () => {}
        const held = new Promise<void>((resolve) => (release = resolve))
        await page.route(/\.woff2$/, async (route) => {
          await held
          await route.continue()
        })

        // The load event would wait for the held font.
        await page.goto(`/${hash}`, { waitUntil: 'domcontentloaded' })
        // Landed in the fallback font: the target is near the top of the
        // viewport, and the web font has not loaded.
        await page.waitForFunction(
          (id) => {
            const top = document.getElementById(id)!.getBoundingClientRect().top
            return window.scrollY > 0 && top >= 0 && top < 200
          },
          hash.slice(1),
          { polling: 'raf' },
        )
        expect(await page.evaluate(() => document.fonts.status)).toBe('loading')

        // A scroll with no input event, then the font.
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), away)
        expect(await page.evaluate(() => window.scrollY)).toBe(away)
        release()
        await waitForLanding(page, hash)

        const metrics = await page.evaluate((id) => ({
          scrollY: window.scrollY,
          top: document.getElementById(id)!.getBoundingClientRect().top,
          viewport: window.innerHeight,
        }), hash.slice(1))
        const detail = JSON.stringify(metrics)
        // The font swap can move the page a little (scroll anchoring), but
        // the target stays far below the viewport.
        expect(Math.abs(metrics.scrollY - away), detail).toBeLessThan(400)
        expect(metrics.top, detail).toBeGreaterThan(metrics.viewport)
        expect(errors).toEqual([])
      } finally {
        await context.close()
      }
    })
  }
}
