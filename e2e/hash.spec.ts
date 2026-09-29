import { expect, type Page } from '@playwright/test'
import { services } from '../src/data/services.ts'
import {
  expectLanded,
  focusedName,
  openPage,
  openPath,
  test,
  waitForFonts,
  waitForScrollSettle,
} from './fixtures.ts'

// Opening the page with a hash in the URL lands on the element the hash
// names, the way the matching in-page link does (#38). Runs once, in the
// chromium project; each test sets its own viewport and motion setting.

const WIDTHS = [360, 1440] as const
const MOTIONS = ['reduce', 'no-preference'] as const

const SECTIONS = ['#services', '#how-we-work', '#future-ready', '#about', '#contact'] as const
const INSIDE = ['#about-heading', '#data-quality-and-reliability-heading'] as const

const disclosures = services.map((service) => `Typical work for ${service.title}`)

/** A header nav link, found whether or not it is currently shown. */
const navLink = (page: Page, name: string) =>
  page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name, exact: true, includeHidden: true })

const menuButton = (page: Page) => page.getByRole('button', { name: 'Menu', includeHidden: true })

/**
 * Shows a header nav link, opening the Menu below 768px, and scrolls it
 * into view. The header isn't sticky, so this scrolls to the top.
 */
async function showNav(page: Page, name: string) {
  const width = page.viewportSize()?.width ?? 0
  if (width < 768) {
    await menuButton(page).click()
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true')
  }
  await navLink(page, name).scrollIntoViewIfNeeded()
  await waitForScrollSettle(page)
}

/** Clicks a header nav link, through the Menu below 768px. */
async function clickNav(page: Page, name: string) {
  await showNav(page, name)
  await navLink(page, name).click()
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

/** Waits for the font and for scrolling to settle, then expects the top. */
async function expectTop(page: Page) {
  await waitForFonts(page)
  await waitForScrollSettle(page)
  expect(await scrollY(page)).toBe(0)
}

/** history.length after a fresh load of / in a new page of the context. */
async function freshHistoryLength(page: Page) {
  const other = await page.context().newPage()
  await other.goto('/')
  const length = await other.evaluate(() => history.length)
  await other.close()
  return length
}

type Sample = { y: number; fontLoaded: boolean }

/**
 * Records window.scrollY on every animation frame from the first one,
 * with whether the Inter face had finished loading at that frame. Call
 * before page.goto.
 */
async function recordScroll(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __samples: Sample[] }
    w.__samples = []
    const fontLoaded = () =>
      [...document.fonts].some(
        (face) => face.family.replace(/^["']|["']$/g, '') === 'Inter Variable' && face.status === 'loaded',
      )
    const tick = () => {
      w.__samples.push({ y: window.scrollY, fontLoaded: fontLoaded() })
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

/** The recorded samples, with consecutive repeats of a position removed. */
async function scrollSteps(page: Page) {
  const samples = await page.evaluate(
    () => (window as unknown as { __samples: Sample[] }).__samples,
  )
  return samples.filter((sample, index) => index === 0 || sample.y !== samples[index - 1].y)
}

test.describe('landing on a fresh load', () => {
  for (const motion of MOTIONS) {
    test.describe(`with ${motion} motion`, () => {
      test.use({ reducedMotion: motion })

      for (const width of WIDTHS) {
        for (const hash of [...SECTIONS, '#main', '#top', ...INSIDE]) {
          test(`/${hash} lands on it at ${width}px, ${motion}`, async ({ page }) => {
            const historyLength = await freshHistoryLength(page)
            await openPath(page, `/${hash}`, width)

            await expectLanded(page, hash)
            expect(await page.evaluate(() => location.hash)).toBe(hash)
            expect(await page.evaluate(() => history.length)).toBe(historyLength)
            if (width < 768) {
              await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false')
            }
          })
        }

        test(`/?utm_source=email#contact lands on #contact and keeps the query at ${width}px, ${motion}`, async ({
          page,
        }) => {
          await openPath(page, '/?utm_source=email#contact', width)

          await expectLanded(page, '#contact')
          expect(await page.evaluate(() => [location.search, location.hash])).toEqual([
            '?utm_source=email',
            '#contact',
          ])
        })
      }
    })
  }
})

test.describe('hashes that name nothing visible', () => {
  test.use({ reducedMotion: 'reduce' })

  const hashes = [
    '#',
    '#nope',
    '#Services',
    '#a.b',
    '#1',
    '#%E0%A4%A',
    '#%22%3E%3Cimg%20src%3Dx%3E',
  ]

  const elementCount = (page: Page) =>
    page.evaluate(() => document.querySelectorAll('*').length)

  for (const width of WIDTHS) {
    for (const hash of hashes) {
      test(`/${hash} stays at the top, keeps the URL and adds nothing at ${width}px`, async ({
        page,
        baseURL,
      }) => {
        const home = await page.context().newPage()
        await openPage(home, width)
        const count = await elementCount(home)
        await home.close()

        await openPath(page, `/${hash}`, width)
        await expectTop(page)
        expect(await page.evaluate(() => location.href)).toBe(new URL(`/${hash}`, baseURL).href)
        expect(await elementCount(page)).toBe(count)
      })
    }

    test(`a hidden disclosure panel stays at the top, with every disclosure closed, at ${width}px`, async ({
      page,
    }) => {
      const hash = '#data-platform-architecture-typical-work'
      await openPath(page, `/${hash}`, width)

      await expectTop(page)
      expect(await page.evaluate(() => location.hash)).toBe(hash)
      await expect(page.locator(hash)).toBeHidden()
      for (const name of disclosures) {
        await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
          'aria-expanded',
          'false',
        )
      }
    })
  }
})

test.describe('URL-encoded hashes', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const width of WIDTHS) {
    test(`/#how%2Dwe%2Dwork lands on #how-we-work at ${width}px`, async ({ page }) => {
      await openPath(page, '/#how%2Dwe%2Dwork', width)
      await expectLanded(page, '#how-we-work')
      expect(await page.evaluate(() => location.hash)).toBe('#how%2Dwe%2Dwork')
    })

    test(`/#contact%20 stays at the top at ${width}px`, async ({ page }) => {
      await openPath(page, '/#contact%20', width)
      await expectTop(page)
      expect(await page.evaluate(() => location.hash)).toBe('#contact%20')
    })
  }
})

test.describe('motion', () => {
  for (const motion of MOTIONS) {
    test.describe(`with ${motion} motion`, () => {
      test.use({ reducedMotion: motion })

      for (const width of WIDTHS) {
        for (const hash of ['#services', '#contact'] as const) {
          test(`/${hash} jumps straight to it at ${width}px, ${motion}`, async ({ page }) => {
            await recordScroll(page)
            await openPath(page, `/${hash}`, width)
            await expectLanded(page, hash)
            // One more frame, so the last sample is the settled position.
            await page.evaluate(() => new Promise(requestAnimationFrame))
            const landed = await scrollY(page)

            // 0, then the landed position, then at most one correction,
            // recorded once the font has loaded, to the settled position.
            const steps = await scrollSteps(page)
            const moves = steps[0].y === 0 ? steps.slice(1) : steps
            const detail = JSON.stringify(steps)
            expect(moves.length, detail).toBeGreaterThanOrEqual(1)
            expect(moves.length, detail).toBeLessThanOrEqual(2)
            expect(moves.at(-1)?.y, detail).toBe(landed)
            if (moves.length === 2) expect(moves[1].fontLoaded, detail).toBe(true)
          })
        }

        test(`in-page links keep their scroll behaviour after landing at ${width}px, ${motion}`, async ({
          page,
        }) => {
          await openPath(page, '/#contact', width)
          await expectLanded(page, '#contact')
          expect(
            await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
          ).toBe(motion === 'reduce' ? 'auto' : 'smooth')

          // Showing the link scrolls up to the header; the click then
          // scrolls down to #services.
          await showNav(page, 'Services')
          const from = await scrollY(page)
          await page.evaluate(() => {
            const w = window as unknown as { __samples: Sample[] }
            w.__samples = []
            const tick = () => {
              w.__samples.push({ y: window.scrollY, fontLoaded: true })
              requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          })
          await navLink(page, 'Services').click()
          await expectLanded(page, '#services')
          expect(await page.evaluate(() => location.hash)).toBe('#services')

          // A smooth scroll passes through positions between the two.
          const to = await scrollY(page)
          expect(to).toBeGreaterThan(from)
          const between = (await scrollSteps(page)).filter(
            (step) => step.y > from && step.y < to,
          )
          if (motion === 'no-preference') {
            expect(between.length).toBeGreaterThan(1)
          } else {
            expect(between).toEqual([])
          }
        })
      }
    })
  }
})

test.describe('font loading', () => {
  test.use({ reducedMotion: 'reduce' })

  const FONT = /\.woff2$/

  /** Holds the woff2 back until the returned function is called. */
  async function holdFont(page: Page) {
    let release = () => {}
    const released = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route(FONT, async (route) => {
      await released
      await route.continue()
    })
    // Released after 2 seconds at the latest.
    setTimeout(release, 2_000)
    return release
  }

  const interLoaded = (page: Page) =>
    page.evaluate(() =>
      [...document.fonts].some(
        (face) => face.family.replace(/^["']|["']$/g, '') === 'Inter Variable' && face.status === 'loaded',
      ),
    )

  for (const width of WIDTHS) {
    test(`/#contact is in view before the font arrives and lands after it at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      const release = await holdFont(page)
      await page.goto('/#contact', { waitUntil: 'commit' })

      await expect(page.locator('#contact')).toBeInViewport({ timeout: 1_500 })
      expect(await interLoaded(page)).toBe(false)

      release()
      await waitForFonts(page)
      expect(await interLoaded(page)).toBe(true)
      await expectLanded(page, '#contact')
    })

    test(`scrolling before the font arrives isn't undone at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      const release = await holdFont(page)
      await page.goto('/#contact', { waitUntil: 'commit' })
      await expect(page.locator('#contact')).toBeInViewport({ timeout: 1_500 })
      await waitForScrollSettle(page)

      await page.mouse.move(width / 2, 400)
      await page.mouse.wheel(0, 300)
      await waitForScrollSettle(page)
      const before = await page.evaluate(() => ({
        y: window.scrollY,
        contact: document.getElementById('contact')!.getBoundingClientRect().top + window.scrollY,
      }))
      expect(await interLoaded(page)).toBe(false)

      release()
      await waitForFonts(page)
      await waitForScrollSettle(page)
      const after = await page.evaluate(() => ({
        y: window.scrollY,
        contact: document.getElementById('contact')!.getBoundingClientRect().top + window.scrollY,
        max: document.documentElement.scrollHeight - window.innerHeight,
      }))

      // Where the visitor left it, moved by the font swap's shift above
      // #contact, and never past the bottom of the page.
      const expected = Math.min(before.y + (after.contact - before.contact), after.max)
      const detail = JSON.stringify({ before, after })
      expect(Math.abs(after.y - expected), detail).toBeLessThanOrEqual(1)
    })

    test(`/#contact shifts the layout no more than / at ${width}px`, async ({ browser }) => {
      async function layoutShift(path: string) {
        const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: 'reduce' })
        await page.goto(path)
        const total = await page.evaluate(async () => {
          let sum = 0
          const add = (entries: PerformanceEntryList) => {
            for (const entry of entries) sum += (entry as unknown as { value: number }).value
          }
          const observer = new PerformanceObserver((list) => add(list.getEntries()))
          observer.observe({ type: 'layout-shift', buffered: true })
          await document.fonts.ready
          await new Promise(requestAnimationFrame)
          add(observer.takeRecords())
          observer.disconnect()
          return sum
        })
        await page.close()
        return total
      }

      const home = await layoutShift('/')
      const contact = await layoutShift('/#contact')
      expect(contact, JSON.stringify({ home, contact })).toBeLessThanOrEqual(home)
    })
  }
})

test.describe('keyboard focus', () => {
  test.use({ reducedMotion: 'reduce' })

  const cases = [
    { path: '/#services', next: disclosures[0] },
    { path: '/#how-we-work', next: 'Email us' },
    { path: '/#future-ready', next: 'Email us' },
    { path: '/#about', next: 'Email us' },
    { path: '/#contact', next: 'Email us' },
    { path: '/#main', next: 'Contact our team' },
    { path: '/#top', next: 'Skip to content' },
    { path: '/#nope', next: 'Skip to content' },
    { path: '/', next: 'Skip to content' },
  ]

  for (const width of WIDTHS) {
    for (const { path, next } of cases) {
      test(`${path} leaves focus on body, then Tab goes to "${next}" at ${width}px`, async ({
        page,
      }) => {
        // Known failure, raised with the owner on #38: the browser's own
        // fragment navigation on load focuses <main>, which has
        // tabindex="-1", as the skip link does. Tab still goes to
        // "Contact our team".
        test.fail(path === '/#main', 'the browser focuses <main> for /#main (#38)')
        await openPath(page, path, width)
        await waitForScrollSettle(page)

        expect(await focusedName(page)).toBe('body')
        expect(await page.evaluate(() => document.querySelectorAll(':focus-visible').length)).toBe(0)

        await page.keyboard.press('Tab')
        expect(await focusedName(page)).toBe(next)
      })
    }
  }
})

test.describe('history', () => {
  for (const motion of MOTIONS) {
    test.describe(`with ${motion} motion`, () => {
      test.use({ reducedMotion: motion })

      test(`back and forward through two in-page links at 1440px, ${motion}`, async ({ page }) => {
        await openPage(page, 1440)
        await clickNav(page, 'Services')
        await expectLanded(page, '#services')
        await clickNav(page, 'Contact')
        await expectLanded(page, '#contact')

        await page.goBack()
        await expect(page).toHaveURL(/\/#services$/)
        await expectLanded(page, '#services')

        await page.goBack()
        await expect(page).toHaveURL(/\/$/)
        await waitForScrollSettle(page)
        expect(await scrollY(page)).toBe(0)

        await page.goForward()
        await expect(page).toHaveURL(/\/#services$/)
        await expectLanded(page, '#services')

        await page.goForward()
        await expect(page).toHaveURL(/\/#contact$/)
        await expectLanded(page, '#contact')
      })

      test(`back from an in-page link to a hash the page opened with at 1440px, ${motion}`, async ({
        page,
      }) => {
        await openPath(page, '/#services', 1440)
        await expectLanded(page, '#services')
        await clickNav(page, 'Contact')
        await expectLanded(page, '#contact')

        await page.goBack()
        await expect(page).toHaveURL(/\/#services$/)
        await expectLanded(page, '#services')
      })

      test(`back from another page to /#contact at 1440px, ${motion}`, async ({ page }) => {
        await openPath(page, '/#contact', 1440)
        await expectLanded(page, '#contact')
        await page.goto('/robots.txt')

        await page.goBack()
        await expect(page).toHaveURL(/\/#contact$/)
        await waitForFonts(page)
        await expectLanded(page, '#contact')
      })
    })
  }
})

test.describe('reload', () => {
  for (const motion of MOTIONS) {
    test.describe(`with ${motion} motion`, () => {
      test.use({ reducedMotion: motion })

      test(`reloading straight after landing lands again at 1440px, ${motion}`, async ({ page }) => {
        await openPath(page, '/#contact', 1440)
        await expectLanded(page, '#contact')

        await page.reload()
        await waitForFonts(page)
        await expectLanded(page, '#contact')
      })

      // At 1440 × 800 #contact lands at the bottom limit, so the footer is
      // already in view and the position before the reload is #contact's
      // landed position. The second case, beyond the criteria, scrolls up
      // to #services instead, so a jump to #contact would show. It does:
      // Chromium restores the position, then scrolls to #contact, or the
      // other way round. Known failure, raised with the owner on #38.
      for (const to of ['footer', '#services'] as const) {
        test(`reloading after scrolling to ${to} keeps the position at 1440px, ${motion}`, async ({
          page,
        }) => {
          test.fail(to === '#services', 'Chromium scrolls to #contact on the reload (#38)')
          await openPath(page, '/#contact', 1440)
          await expectLanded(page, '#contact')
          const contactLanded = await scrollY(page)
          await page.evaluate((target) => {
            const element =
              target === 'footer' ? document.querySelector('footer') : document.querySelector(target)
            element?.scrollIntoView({ behavior: 'instant', block: 'start' })
          }, to)
          await waitForScrollSettle(page)
          const before = await scrollY(page)

          await recordScroll(page)
          await page.reload()
          await waitForFonts(page)
          await waitForScrollSettle(page)
          await page.evaluate(() => new Promise(requestAnimationFrame))

          const after = await scrollY(page)
          const steps = await scrollSteps(page)
          const detail = JSON.stringify({ before, after, contactLanded, steps })
          expect(Math.abs(after - before), detail).toBeLessThanOrEqual(1)
          // Every position on the way, before the final one, is short of
          // #contact's landed position.
          const onTheWay = steps.slice(0, -1).map((step) => step.y)
          expect(onTheWay.filter((y) => y >= contactLanded - 1), detail).toEqual([])
        })
      }
    })
  }
})
