import { expect, type Page } from '@playwright/test'
import { openPage, pressTab, test, waitForScrollSettle } from './fixtures.ts'

// The header over the real dark hero (#55), the visual check #54
// deferred: transparent at the top, solid from 8px of scroll and with the
// menu open, and on top of the hero when it does not stick. Runs in the
// chromium and webkit projects.

const HERO = 'Trusted Data. Better Decisions.'
const banner = (page: Page) => page.getByRole('banner')

/** A token resolved to its computed rgb() form, in the page's root. */
function token(page: Page, name: string) {
  return page.evaluate((name) => {
    const probe = document.createElement('div')
    probe.style.color = `var(${name})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, name)
}

/** The header's fill, bottom border, logo and controls' colours. */
function headerLook(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector('header')!
    const style = getComputedStyle(header)
    const colour = (selector: string) => {
      const element = header.querySelector(selector)
      if (!element || getComputedStyle(element).display === 'none') return null
      const s = getComputedStyle(element)
      return { text: s.color, background: s.backgroundColor, border: s.borderTopColor }
    }
    return {
      transparent: header.classList.contains('on-dark'),
      background: style.backgroundColor,
      border: style.borderBottomColor,
      logo: header.querySelector('img')!.getAttribute('src'),
      link: colour('.site-nav__link'),
      cta: colour('.site-nav__cta .button'),
      toggle: colour('.menu-toggle'),
    }
  })
}

/** Waits for the header's colour transition, if any, to finish. */
async function settleHeader(page: Page) {
  await banner(page).evaluate((element) =>
    Promise.all(
      [element, ...element.querySelectorAll('*')].flatMap((child) =>
        child.getAnimations().map((animation) => animation.finished),
      ),
    ),
  )
}

test.describe('transparent over the hero at the top of the page', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [360, 800],
  ]) {
    test(`no fill or border, reversed logo, dark controls at ${width} x ${height}`, async ({
      page,
      browserName,
    }, testInfo) => {
      await openPage(page, width, height)
      await page.mouse.move(width / 2, height - 1)
      await settleHeader(page)
      const look = await headerLook(page)
      const [paper, teal400, graphite900, graphite700] = await Promise.all(
        ['--paper', '--teal-400', '--graphite-900', '--graphite-700'].map((name) => token(page, name)),
      )

      expect(look.transparent).toBe(true)
      expect(look.background).toBe('rgba(0, 0, 0, 0)')
      expect(look.border).toBe('rgba(0, 0, 0, 0)')
      expect(look.logo).toBe('/fafanua-logo-reversed.svg')
      // The hero's top is the page's top, under the header.
      expect(
        await page.getByRole('region', { name: HERO }).evaluate((element) => element.getBoundingClientRect().top),
      ).toBe(0)
      if (width >= 1024) {
        expect(look.link?.text, 'nav link').toBe(paper)
        expect(look.cta, 'Discuss a project').toEqual({ text: graphite900, background: teal400, border: 'rgba(0, 0, 0, 0)' })
        expect(look.toggle).toBeNull()
      } else {
        // The secondary button on dark.
        expect(look.toggle, 'Menu').toEqual({ text: paper, background: 'rgba(0, 0, 0, 0)', border: graphite700 })
      }

      await page.screenshot({
        path: `${testInfo.project.outputDir}/screenshots/header-over-hero-${browserName}-${width}x${height}.png`,
      })
    })
  }
})

// The header's state from the very first frame of a load with normal
// motion (#55 QA, #62): it must start transparent over the hero, with its
// links, Menu and border in their final colours, never in the browser's
// defaults or the solid paper state, and never fade from either. An init
// script records, on every animation frame from navigation start, the
// header's fill, border and class and the colours of every link and
// button shown in it, and every transition that starts in the header.
//
// Until #62, Vite put the module script before the stylesheet, and WebKit
// could run it before any CSS applied: the header was first styled with
// the browser defaults (link blue, a near-black border) and faded from
// them. The built page now holds the script until the stylesheet has
// loaded (vite.config.ts), so these fail if it ever starts unstyled. The
// CSS is delayed to make the race likely: by 150, 400 and 1000 ms on a
// single load, and not at all with 20 loads at once.

type Look = { background: string; border: string; className: string; controls: string[] }
type Frame = Look & { t: number; y: number }
type Log = { __frames: Frame[]; __transitions: string[]; __styledAtInsert: boolean | null }

/** Delays every stylesheet response by a number of milliseconds. */
async function delayCss(page: Page, delay: number) {
  if (delay === 0) return
  await page.route(/\.css$/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay))
    await route.continue()
  })
}

/**
 * Records the header's look on every frame until `until` ms after
 * navigation start, and every transition that starts in it. Call before
 * page.goto.
 */
async function recordHeader(page: Page, until: number) {
  await page.addInitScript((until) => {
    const w = window as unknown as Log
    w.__frames = []
    w.__transitions = []
    w.__styledAtInsert = null
    new MutationObserver((_, observer) => {
      if (!document.querySelector('header')) return
      w.__styledAtInsert = document.styleSheets.length > 0
      observer.disconnect()
    }).observe(document, { childList: true, subtree: true })
    document.addEventListener(
      'transitionrun',
      (event) => {
        const target = event.target as Element
        if (target.closest?.('header')) {
          w.__transitions.push(`${target.tagName}.${target.className} ${event.propertyName}`)
        }
      },
      true,
    )
    const tick = () => {
      const header = document.querySelector('header')
      if (header) {
        const style = getComputedStyle(header)
        w.__frames.push({
          t: Math.round(performance.now()),
          y: window.scrollY,
          background: style.backgroundColor,
          border: style.borderBottomColor,
          className: header.className,
          // Every link and button shown: its name, text colour and border.
          controls: [...header.querySelectorAll('a, button')]
            .filter((element) => element.getClientRects().length > 0)
            .map((element) => {
              const s = getComputedStyle(element)
              return `${element.textContent?.trim() || element.getAttribute('aria-label')}: ${s.color} / ${s.backgroundColor} / ${s.borderTopColor}`
            }),
        })
      }
      if (performance.now() < until) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, until)
}

async function headerLog(page: Page, until: number) {
  await page.waitForFunction((until) => performance.now() >= until, until)
  return page.evaluate(() => {
    const w = window as unknown as Log
    return { frames: w.__frames, transitions: w.__transitions, styled: w.__styledAtInsert }
  })
}

/**
 * Expects every recorded frame at scroll 0 to show the header exactly as
 * it settles, transparent over the hero, with nothing transitioning: no
 * frame shows a browser default or the solid state, even part way through
 * a fade.
 */
async function expectStyledFromTheStart(page: Page, width: number, log: Awaited<ReturnType<typeof headerLog>>) {
  const [paper, solidBorder] = await Promise.all([token(page, '--paper'), token(page, '--color-border')])
  expect(log.styled, 'a stylesheet had applied when the header was inserted').toBe(true)
  expect(log.transitions, 'transitions in the header').toEqual([])

  const atTop = log.frames.filter((frame) => frame.y < 8)
  expect(atTop.length, 'frames recorded at scroll 0').toBeGreaterThan(0)
  const settled = atTop.at(-1)!
  expect(settled.className).toBe('site-header on-dark')
  expect(settled.background).toBe('rgba(0, 0, 0, 0)')
  expect(settled.border).toBe('rgba(0, 0, 0, 0)')
  expect(settled.border).not.toBe(solidBorder)
  // The nav links (from 1024px) or the Menu text (below) are paper.
  const shown = settled.controls.find((control) => control.startsWith(width >= 1024 ? 'Services:' : 'Menu:'))
  expect(shown, JSON.stringify(settled.controls)).toMatch(new RegExp(`: ${paper.replace(/[()]/g, '\\$&')} /`))

  for (const frame of atTop) {
    const { t, y, ...look } = frame
    expect(look, `frame at ${t}ms (scroll ${y})`).toEqual({
      background: settled.background,
      border: settled.border,
      className: settled.className,
      controls: settled.controls,
    } satisfies Look)
  }
}

test.describe('first frames of a load', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const delay of [0, 150, 400, 1000]) {
    for (const [width, height] of [
      [1440, 900],
      [360, 800],
    ]) {
      test(`styled and transparent from the first frame, with the CSS ${delay ? `delayed ${delay}ms` : 'not delayed'}, at ${width} x ${height}`, async ({
        page,
      }) => {
        const until = delay + 1500
        await delayCss(page, delay)
        await recordHeader(page, until)
        await page.setViewportSize({ width, height })
        await page.goto('/')
        const log = await headerLog(page, until)
        await expectStyledFromTheStart(page, width, log)
      })
    }
  }

  // 20 pages loading at once made WebKit run the script first in 15 to 19
  // of 20 loads before #62.
  for (const [width, height] of [
    [1440, 900],
    [360, 800],
  ]) {
    test(`styled from the first frame in each of 20 loads at once at ${width} x ${height}`, async ({
      browser,
      baseURL,
    }) => {
      test.setTimeout(60_000)
      const until = 1500
      const contexts = await Promise.all(
        Array.from({ length: 20 }, () =>
          browser.newContext({ baseURL, viewport: { width, height }, reducedMotion: 'no-preference' }),
        ),
      )
      try {
        const results = await Promise.all(
          contexts.map(async (context, index) => {
            const page = await context.newPage()
            const errors: string[] = []
            page.on('pageerror', (error) => errors.push(error.message))
            page.on('console', (message) => {
              if (message.type() === 'error') errors.push(message.text())
            })
            await recordHeader(page, until)
            await page.goto('/')
            return { index, page, errors, log: await headerLog(page, until) }
          }),
        )
        for (const { index, page, errors, log } of results) {
          await test.step(`load ${index + 1}`, async () => {
            expect(errors).toEqual([])
            await expectStyledFromTheStart(page, width, log)
          })
        }
      } finally {
        await Promise.all(contexts.map((context) => context.close()))
      }
    })
  }
})

test.describe('scrolling', () => {
  for (const motion of ['reduce', 'no-preference'] as const) {
    test(`solid from 8px and transparent again at the top, ${motion} motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion })
      await openPage(page, 1440, 900)
      const [paper, border] = await Promise.all(['--color-bg', '--color-border'].map((name) => token(page, name)))

      for (const [y, solid] of [
        [0, false],
        [7, false],
        [8, true],
        [600, true],
        [0, false],
      ] as const) {
        await page.evaluate((top) => window.scrollTo(0, top), y)
        await waitForScrollSettle(page)
        await expect(banner(page)).toHaveClass(solid ? /^site-header$/ : /\bon-dark\b/)
        await settleHeader(page)
        const look = await headerLook(page)
        if (solid) {
          expect(look, `at ${y}`).toMatchObject({ background: paper, border, logo: '/fafanua-logo.svg' })
        } else {
          expect(look, `at ${y}`).toMatchObject({
            background: 'rgba(0, 0, 0, 0)',
            border: 'rgba(0, 0, 0, 0)',
            logo: '/fafanua-logo-reversed.svg',
          })
        }
      }

      // No transition with reduced motion; the colours only otherwise.
      const duration = await banner(page).evaluate((element) => getComputedStyle(element).transitionDuration)
      if (motion === 'reduce') expect(parseFloat(duration)).toBeLessThanOrEqual(0.00001)
      else expect(parseFloat(duration)).toBeGreaterThan(0)
    })
  }
})

test.describe('Menu at 360 x 800, scroll 0', () => {
  test.use({ reducedMotion: 'reduce' })

  test('opening it makes the header solid; Escape closes it and returns focus', async ({ page }) => {
    await openPage(page, 360, 800)
    await expect(banner(page)).toHaveClass(/\bon-dark\b/)
    const [paper, heading] = await Promise.all(['--color-bg', '--color-heading'].map((name) => token(page, name)))

    await page.getByRole('link', { name: 'Fafanua Technologies' }).focus()
    await pressTab(page)
    const toggle = page.getByRole('button', { name: 'Menu' })
    await expect(toggle).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await expect(banner(page)).not.toHaveClass(/\bon-dark\b/)
    await settleHeader(page)
    expect((await headerLook(page)).logo).toBe('/fafanua-logo.svg')
    // The open list is readable over the hero: an opaque paper fill, and
    // dark link text.
    const list = await page.locator('#main-nav-list').evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      link: getComputedStyle(element.querySelector('.site-nav__link')!).color,
    }))
    expect(list).toEqual({ background: paper, link: heading })
    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
    await expect(banner(page)).toHaveClass(/\bon-dark\b/)
    expect((await headerLook(page)).logo).toBe('/fafanua-logo-reversed.svg')
  })
})

test.describe('skip link over the transparent header', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const width of [360, 1440]) {
    test(`appears without moving anything, then focuses main at scroll 0, at ${width}px`, async ({ page }) => {
      await openPage(page, width)
      const layout = () =>
        page.evaluate(() => ({
          header: document.querySelector('header')!.getBoundingClientRect().height,
          hero: document.querySelector('main > [data-header-overlay]')!.getBoundingClientRect().top,
          heading: document.querySelector('main h1')!.getBoundingClientRect().top,
        }))
      const before = await layout()

      await pressTab(page)
      const skip = page.getByRole('link', { name: 'Skip to content' })
      await expect(skip).toBeFocused()
      await expect(skip).toBeInViewport()
      expect(await layout()).toEqual(before)

      await page.keyboard.press('Enter')
      await waitForScrollSettle(page)
      expect(await page.evaluate(() => document.activeElement?.id)).toBe('main')
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      await expect(banner(page)).toHaveClass(/\bon-dark\b/)
      const { heading, headerBottom } = await page.evaluate(() => ({
        heading: document.querySelector('main h1')!.getBoundingClientRect().top,
        headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
      }))
      expect(heading).toBeGreaterThanOrEqual(headerBottom)
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
    })
  }
})

// When the header does not stick (a short viewport, or the 25% rule), it
// is position: relative with z-index 1, so it still paints above the
// hero, which its technical grid makes positioned and which is pulled up
// under it.
test.describe('a header that does not stick stays above the hero', () => {
  const cases = [
    { name: 'short viewport, 640 x 400', width: 640, height: 400, text: '100%' },
    { name: '25% rule, 320 x 800 with 200% text', width: 320, height: 800, text: '200%' },
  ]

  for (const { name, width, height, text } of cases) {
    test(`logo, Menu and its focus ring are on top: ${name}`, async ({ page }) => {
      await openPage(page, width, height)
      if (text !== '100%') {
        await page.addStyleTag({ content: `html { font-size: ${text}; }` })
      }
      await expect
        .poll(() => banner(page).evaluate((element) => getComputedStyle(element).position))
        .toBe('relative')
      const hero = page.getByRole('region', { name: HERO })
      // Pulled up under the header: its top is the page's top.
      expect(await hero.evaluate((element) => element.getBoundingClientRect().top)).toBe(0)
      expect(await hero.evaluate((element) => getComputedStyle(element).position)).toBe('relative')
      await expect(banner(page)).toHaveClass(/\bon-dark\b/)

      // The topmost element at a point is inside the header.
      const onTop = (x: number, y: number) =>
        page.evaluate(
          ([px, py]) => {
            const hit = document.elementFromPoint(px, py)
            return hit !== null && document.querySelector('header')!.contains(hit)
          },
          [x, y],
        )
      const centre = async (name: string, role: 'link' | 'button') => {
        const box = await banner(page).getByRole(role, { name }).boundingBox()
        if (!box) throw new Error(`${name} has no box`)
        return box
      }
      const logo = await centre('Fafanua Technologies', 'link')
      const menu = await centre('Menu', 'button')
      expect(await onTop(logo.x + logo.width / 2, logo.y + logo.height / 2), 'logo').toBe(true)
      expect(await onTop(menu.x + menu.width / 2, menu.y + menu.height / 2), 'Menu').toBe(true)

      // The focus ring: 2px wide, 2px outside the toggle, so 3px outside
      // its edge is on the ring.
      await page.getByRole('link', { name: 'Fafanua Technologies' }).focus()
      await pressTab(page)
      const toggle = page.getByRole('button', { name: 'Menu' })
      await expect(toggle).toBeFocused()
      expect(await toggle.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
      const ring = await toggle.evaluate((element) => {
        const style = getComputedStyle(element)
        return `${style.outlineWidth} ${style.outlineStyle} ${style.outlineOffset}`
      })
      expect(ring).toBe('2px solid 2px')
      const midY = menu.y + menu.height / 2
      expect(await onTop(menu.x - 3, midY), 'ring, left').toBe(true)
      expect(await onTop(menu.x + menu.width + 3, midY), 'ring, right').toBe(true)
      expect(await onTop(menu.x + menu.width / 2, menu.y - 3), 'ring, top').toBe(true)
      expect(await onTop(menu.x + menu.width / 2, menu.y + menu.height + 3), 'ring, bottom').toBe(true)
    })
  }
})
