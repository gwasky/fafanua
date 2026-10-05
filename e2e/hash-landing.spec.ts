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
// scrolls away in script, before the font arrives. An init script counts
// the scrollIntoView calls on the target: one is the landing, a second
// would be the correction. Before the fix, the page jumped back to the
// target once the font loaded, 12 of 12 times after a jump away, and 16
// of 16 times after a slow drift of 1px a frame (#62 QA).

/**
 * Cold-loads a hash with the web font held back, waits for it to land in
 * the fallback font, runs `away` (a scroll with no input event), then
 * releases the font and waits for the landing to settle. Returns the
 * scroll position just before and after the font, the target's top, and
 * how many times the page scrolled the target into view.
 */
async function scrollAwayBeforeFont(
  browser: Browser,
  baseURL: string | undefined,
  { width, motion }: Omit<Load, 'delay'>,
  hash: string,
  away: (page: Page) => Promise<void>,
) {
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
    await page.addInitScript((id) => {
      const w = window as { __intoView?: number }
      w.__intoView = 0
      const original = Element.prototype.scrollIntoView
      Element.prototype.scrollIntoView = function (this: Element, ...args) {
        if (this.id === id) w.__intoView! += 1
        return original.apply(this, args)
      }
    }, hash.slice(1))
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
    const landed = await page.evaluate(() => window.scrollY)

    await away(page)
    expect(await page.evaluate(() => document.fonts.status), 'font still held').toBe('loading')
    const before = await page.evaluate(() => window.scrollY)
    release()
    await waitForLanding(page, hash)

    const after = await page.evaluate((id) => ({
      scrollY: window.scrollY,
      top: document.getElementById(id)!.getBoundingClientRect().top,
      viewport: window.innerHeight,
      intoView: (window as { __intoView?: number }).__intoView,
    }), hash.slice(1))
    expect(errors).toEqual([])
    return { landed, before, ...after }
  } finally {
    await context.close()
  }
}

for (const motion of MOTIONS) {
  for (const width of WIDTHS) {
    test(`a scroll away with no input event before the font loads is kept, at ${width}px, ${motion}`, async ({
      browser,
      baseURL,
    }) => {
      const away = 2000
      const result = await scrollAwayBeforeFont(browser, baseURL, { width, motion }, '#about', async (page) => {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), away)
        expect(await page.evaluate(() => window.scrollY)).toBe(away)
      })
      const detail = JSON.stringify(result)
      expect(result.intoView, `no correction: ${detail}`).toBe(1)
      // The font swap can move the page a little (scroll anchoring), but
      // the target stays far below the viewport.
      expect(Math.abs(result.scrollY - away), detail).toBeLessThan(400)
      expect(result.top, detail).toBeGreaterThan(result.viewport)
    })

    // A slow, steady scroll, such as a slow scrollbar drag or an
    // assistive-technology scroll: 1px every frame for 90 frames, which
    // no single frame's move would reveal.
    for (const hash of ['#about', '#managed-services'] as const) {
      test(`a slow scroll away of 1px a frame with no input event before the font loads is kept, ${hash}, at ${width}px, ${motion}`, async ({
        browser,
        baseURL,
      }) => {
        const frames = 90
        const result = await scrollAwayBeforeFont(browser, baseURL, { width, motion }, hash, (page) =>
          page.evaluate(
            (count) =>
              new Promise<void>((resolve) => {
                let left = count
                const step = () => {
                  window.scrollBy({ top: 1, behavior: 'instant' })
                  if (--left > 0) requestAnimationFrame(step)
                  else resolve()
                }
                requestAnimationFrame(step)
              }),
            frames,
          ),
        )
        const detail = JSON.stringify(result)
        // WebKit can land on a subpixel position, so allow a pixel either way.
        expect(Math.abs(result.before - result.landed - frames), `drifted: ${detail}`).toBeLessThanOrEqual(1)
        expect(result.intoView, `no correction: ${detail}`).toBe(1)
      })
    }
  }
}
