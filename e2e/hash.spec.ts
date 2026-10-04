import { expect, type Page } from '@playwright/test'
import { services } from '../src/data/services.ts'
import {
  expectLanded,
  focusedName,
  linkName,
  openPage,
  openPath,
  pressTab,
  test,
  waitForFonts,
  waitForScrollSettle,
} from './fixtures.ts'

// Opening the page with a hash in the URL lands on the element the hash
// names, the way the matching in-page link does (#38). Runs once, in the
// chromium project; each test sets its own viewport and motion setting.
// The branches on browserName are for the webkit project (#45), which
// doesn't run this spec yet; each says why WebKit is expected to behave
// differently, with measured values.

const WIDTHS = [360, 1440] as const
const MOTIONS = ['reduce', 'no-preference'] as const

const SECTIONS = ['#services', '#solutions', '#how-we-work', '#future-ready', '#about', '#contact'] as const
const INSIDE = ['#about-heading', '#data-quality-and-reliability-heading', '#managed-services'] as const

const disclosures = services.map((service) => `Typical engagements for ${service.name}`)

/** A header nav link, found whether or not it is currently shown. */
const navLink = (page: Page, name: string) =>
  page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: linkName(name), includeHidden: true })

const menuButton = (page: Page) => page.getByRole('button', { name: 'Menu', includeHidden: true })

/**
 * Shows a header nav link, opening the Menu below 1024px. The header is
 * sticky (#54), so the link is already in view and nothing scrolls.
 */
async function showNav(page: Page, name: string) {
  const width = page.viewportSize()?.width ?? 0
  if (width < 1024) {
    await menuButton(page).click()
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true')
  }
  await navLink(page, name).scrollIntoViewIfNeeded()
  await waitForScrollSettle(page)
}

/**
 * Clicks a header nav link, through the Menu below 1024px. Returns
 * window.scrollY just before the click: the position the current history
 * entry is left at, which WebKit restores when going back to it.
 */
async function clickNav(page: Page, name: string) {
  await showNav(page, name)
  const leftAt = await page.evaluate(() => window.scrollY)
  await navLink(page, name).click()
  return leftAt
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

/** Expects scrollY within 1px of a position recorded earlier, once settled. */
async function expectRestored(page: Page, position: number) {
  await waitForScrollSettle(page)
  const y = await scrollY(page)
  expect(Math.abs(y - position), `scrollY ${y}, restored ${position}`).toBeLessThanOrEqual(1)
}

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
            if (width < 1024) {
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
      const hash = `#${services[0].id}-typical-engagements`
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

          // The header is sticky, so showing the link scrolls nothing;
          // the click then scrolls up from #contact to #services.
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
          // Chromium can take several frames to start a smooth scroll,
          // which waitForScrollSettle (in expectLanded) would read as
          // settled, so wait until the page moves first, as links.spec.ts
          // does (#55). An instant jump has already moved.
          await expect.poll(() => scrollY(page)).not.toBe(from)
          await expectLanded(page, '#services')
          expect(await page.evaluate(() => location.hash)).toBe('#services')

          // A smooth scroll passes through positions between the two.
          const to = await scrollY(page)
          expect(to).toBeLessThan(from)
          const between = (await scrollSteps(page)).filter(
            (step) => step.y < from && step.y > to,
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

    test(`/#contact shifts the layout no more than / at ${width}px`, async ({
      browser,
      browserName,
    }) => {
      if (browserName === 'webkit') {
        // WebKit has no layout-shift entries, so the comparison below
        // would sum nothing and pass without measuring. Assert that
        // instead: this fails once WebKit supports them, and the real
        // comparison can then run. Chromium lists 'layout-shift'. In
        // WebKit, the samples in the motion tests cover movement instead.
        const page = await browser.newPage()
        const types = await page.evaluate(() => PerformanceObserver.supportedEntryTypes)
        await page.close()
        expect(types).not.toContain('layout-shift')
        return
      }

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
    { path: '/#solutions', next: 'Email us' },
    { path: '/#how-we-work', next: 'Email us' },
    { path: '/#future-ready', next: 'Email us' },
    { path: '/#about', next: 'Email us' },
    { path: '/#contact', next: 'Email us' },
    { path: '/#main', next: 'Discuss your data needs' },
    { path: '/#top', next: 'Skip to content' },
    { path: '/#nope', next: 'Skip to content' },
    { path: '/', next: 'Skip to content' },
  ]

  for (const width of WIDTHS) {
    for (const { path, next } of cases) {
      const focus = path === '/#main' ? 'focuses main' : 'leaves focus on body'
      test(`${path} ${focus}, then Tab goes to "${next}" at ${width}px`, async ({
        page,
      }) => {
        await openPath(page, path, width)
        await waitForScrollSettle(page)

        if (path === '/#main') {
          // The browser's fragment navigation focuses <main>, which has
          // tabindex="-1", as the skip link does. It may match
          // :focus-visible, so the check is that no ring is drawn.
          const main = await page.evaluate(() => {
            const element = document.activeElement
            return {
              id: element?.id,
              tag: element?.tagName,
              outline: element ? getComputedStyle(element).outlineStyle : '',
            }
          })
          expect(main).toEqual({ id: 'main', tag: 'MAIN', outline: 'none' })
        } else {
          expect(await focusedName(page)).toBe('body')
          expect(
            await page.evaluate(() => document.querySelectorAll(':focus-visible').length),
          ).toBe(0)
        }

        await pressTab(page)
        expect(await focusedName(page)).toBe(next)
      })
    }
  }
})

test.describe('history', () => {
  for (const motion of MOTIONS) {
    test.describe(`with ${motion} motion`, () => {
      test.use({ reducedMotion: motion })

      test(`back and forward through two in-page links at 1440px, ${motion}`, async ({
        page,
        browserName,
      }) => {
        await openPage(page, 1440)
        await clickNav(page, 'Services')
        await expectLanded(page, '#services')
        const servicesLeftAt = await clickNav(page, 'Discuss a project')
        await expectLanded(page, '#contact')

        await page.goBack()
        await expect(page).toHaveURL(/\/#services$/)
        if (browserName === 'webkit') {
          // WebKit restores the position the #services entry was left at,
          // which was the top while the header was not sticky (before #54):
          // showNav scrolled up to it before the click. Measured at 1440 × 800, both motion
          // settings: WebKit 0, Chromium 705 (it scrolls to the fragment).
          // A plain static page with the same ids and links does the same
          // in each engine. A Safari visitor goes back to where they were
          // when they chose the link, as on any other page.
          await expectRestored(page, servicesLeftAt)
        } else {
          await expectLanded(page, '#services')
        }
        const servicesRestoredAt = await scrollY(page)

        await page.goBack()
        await expect(page).toHaveURL(/\/$/)
        await waitForScrollSettle(page)
        expect(await scrollY(page)).toBe(0)

        await page.goForward()
        await expect(page).toHaveURL(/\/#services$/)
        if (browserName === 'webkit' && motion === 'reduce') {
          // Under reduce, WebKit again restores the position the entry was
          // left at by the back above (0). Under no-preference it lands on
          // #services (705), as Chromium does under both. Measured at
          // 1440 × 800; the static page behaves the same. The visitor sees
          // the page as they last left it.
          await expectRestored(page, servicesRestoredAt)
        } else {
          await expectLanded(page, '#services')
        }

        await page.goForward()
        await expect(page).toHaveURL(/\/#contact$/)
        await expectLanded(page, '#contact')
      })

      test(`back from an in-page link to a hash the page opened with at 1440px, ${motion}`, async ({
        page,
        browserName,
      }) => {
        await openPath(page, '/#services', 1440)
        await expectLanded(page, '#services')
        const servicesLeftAt = await clickNav(page, 'Discuss a project')
        await expectLanded(page, '#contact')

        await page.goBack()
        await expect(page).toHaveURL(/\/#services$/)
        if (browserName === 'webkit') {
          // As in the test above: WebKit restores the position the entry
          // was left at (0, after showNav), Chromium lands on #services
          // (705). Measured at 1440 × 800, both motion settings, and the
          // same on the static page.
          await expectRestored(page, servicesLeftAt)
        } else {
          await expectLanded(page, '#services')
        }
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

      // Chromium restores the position and may then also run its own
      // fragment scroll to #contact, so either end state is accepted, but
      // not the top (#38, "Reload after scrolling away"). At 1440 × 800
      // #contact lands at the bottom limit, so the footer case can't tell
      // the two apart; the #services case can.
      for (const to of ['footer', '#services'] as const) {
        test(`reloading after scrolling to ${to} ends where it was or on #contact at 1440px, ${motion}`, async ({
          page,
        }, testInfo) => {
          await openPath(page, '/#contact', 1440)
          await expectLanded(page, '#contact')
          await page.evaluate((target) => {
            const element =
              target === 'footer' ? document.querySelector('footer') : document.querySelector(target)
            element?.scrollIntoView({ behavior: 'instant', block: 'start' })
          }, to)
          await waitForScrollSettle(page)
          const before = await scrollY(page)
          if (to === '#services') expect(before).toBeGreaterThan(0)

          await page.reload()
          await waitForFonts(page)
          await waitForScrollSettle(page)

          const after = await page.evaluate(() => ({
            y: window.scrollY,
            top: document.getElementById('contact')!.getBoundingClientRect().top,
            headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
            max: document.documentElement.scrollHeight - window.innerHeight,
          }))
          const stayed = Math.abs(after.y - before) <= 1
          // Landed below the sticky header, or at the bottom limit.
          const onContact =
            Math.abs(after.top - after.headerBottom) <= 1 ||
            (Math.abs(after.y - after.max) <= 1 && after.top < 800)
          const outcome = stayed ? 'where it was' : onContact ? 'on #contact' : 'elsewhere'
          testInfo.annotations.push({ type: 'reload outcome', description: outcome })
          console.log(`reload after scrolling to ${to}, ${motion}: ${outcome}`)
          expect(outcome, JSON.stringify({ before, after })).not.toBe('elsewhere')
          expect(after.y).toBeGreaterThan(0)
        })
      }
    })
  }
})
