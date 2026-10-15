import { expect, type Browser, type Page } from '@playwright/test'
import { test, waitForLanding } from './fixtures.ts'

// The hash-landing tests that hold the web font back (#62), split from
// hash-landing.spec.ts for #84. Under font-display: fallback the font
// must arrive within its swap period, about 3s after its request; under
// heavy CPU load from other workers WebKit's slow scroll below can take
// longer than that. So this spec runs only in the font-stall-chromium and
// font-stall-webkit projects, after every other project and one test at
// a time (playwright.config.ts).

const WIDTHS = [360, 1440] as const
const MOTIONS = ['reduce', 'no-preference'] as const

type Load = { width: number; motion: (typeof MOTIONS)[number] }

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
  { width, motion }: Load,
  hash: string,
  away: (page: Page) => Promise<void>,
) {
  const context = await browser.newContext({
    baseURL,
    viewport: { width, height: 800 },
    reducedMotion: motion,
  })
  // Released in the finally too, so a failed check never leaves the font
  // held while the context closes.
  let release = () => {}
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
    // No image is needed for WebKit to paint before the font arrives:
    // under font-display: fallback the page paints in the fallback face
    // after the 100ms block period (#84). The font must then arrive within
    // the swap period, about 3s, or Inter is never swapped in and the test
    // would check a page with no swap, so the time from the font's request
    // to its release is checked below.
    const held = new Promise<void>((resolve) => (release = resolve))
    let requestedAt: number | undefined
    await page.route(/\.woff2$/, async (route) => {
      requestedAt ??= Date.now()
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
    expect(requestedAt, 'the woff2 was requested').toBeDefined()
    expect(Date.now() - requestedAt!, 'ms from the font request to its release').toBeLessThan(2_500)
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
    release()
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
