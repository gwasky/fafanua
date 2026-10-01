import { expect, type Page } from '@playwright/test'
import { expectLanded, linkName, openPage, test, waitForScrollSettle } from './fixtures.ts'

// Checks that don't change with the width, or that set their own
// viewport, so they run once per engine, in the chromium and webkit
// projects: the breakpoint boundary, the smooth-scrolling path, the email
// links, and every internal link and asset.

// The header's four section links and its call to action.
const NAV = ['Services', 'Solutions', 'How We Work', 'About', 'Discuss a project'] as const

/** The Menu button, found whether or not it is currently shown. */
const menuButton = (page: Page) =>
  page.getByRole('button', { name: 'Menu', includeHidden: true })

/** A Main nav link, found whether or not it is currently shown. */
const mainNavLink = (page: Page, name: string) =>
  page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: linkName(name), includeHidden: true })

async function expectMenuMode(page: Page) {
  await expect(menuButton(page)).toBeVisible()
  for (const name of NAV) await expect(mainNavLink(page, name)).toBeHidden()
}

async function expectInlineMode(page: Page) {
  await expect(menuButton(page)).toBeHidden()
  for (const name of NAV) await expect(mainNavLink(page, name)).toBeVisible()
}

const scrollBehavior = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)

test.describe('breakpoint boundary', () => {
  // INLINE_NAV_QUERY in Header.tsx and the media query in Header.css must
  // switch at the same width.
  // 64em, which is 1024px at the default text size, since #54: the logo,
  // four links and call to action do not fit on one row at 768px. The
  // em breakpoint at a larger text size is checked in a11y.spec.ts.
  test('Menu at 1023px, inline nav at 1024px', async ({ page }) => {
    await openPage(page, 1023)
    await expectMenuMode(page)

    await openPage(page, 1024)
    await expectInlineMode(page)
  })

  test('a menu open at 1023px is closed after widening to 1024px and back', async ({ page }) => {
    await openPage(page, 1023)
    const toggle = menuButton(page)
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await page.setViewportSize({ width: 1024, height: 800 })
    await expectInlineMode(page)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await page.setViewportSize({ width: 1023, height: 800 })
    await expectMenuMode(page)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('smooth scrolling', () => {
  test.use({ reducedMotion: 'no-preference' })

  const cases = [
    { from: 'header', name: 'Services', hash: '#services' },
    { from: 'header', name: 'Discuss a project', hash: '#contact' },
    { from: 'footer', name: 'Services', hash: '#services' },
  ] as const

  for (const width of [360, 1440]) {
    for (const { from, name, hash } of cases) {
      test(`${from} "${name}" lands on ${hash} after a smooth scroll at ${width}px`, async ({ page }) => {
        await openPage(page, width)
        expect(await scrollBehavior(page)).toBe('smooth')

        const footer = page.getByRole('contentinfo')
        if (from === 'header' && width < 1024) {
          await menuButton(page).click()
          await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true')
        } else if (from === 'footer') {
          await footer.scrollIntoViewIfNeeded()
          await waitForScrollSettle(page)
        }

        await (from === 'header'
          ? mainNavLink(page, name)
          : footer.getByRole('link', { name, exact: true })
        ).click()

        expect(await page.evaluate(() => location.hash)).toBe(hash)
        await expectLanded(page, hash)
      })
    }
  }
})

test.describe('email links', () => {
  test('all three are exactly mailto:info@fafanua.tech', async ({ page }) => {
    await openPage(page, 1440)
    const links = page.locator('a[href^="mailto:"]')
    await expect(links).toHaveCount(3)

    // Read, never clicked: a click would open a mail client.
    for (const link of await links.all()) {
      expect(await link.getAttribute('href')).toBe('mailto:info@fafanua.tech')
    }
  })
})

test.describe('internal links and assets', () => {
  test('every response from the preview during page load is 200', async ({ page, baseURL }) => {
    // The page fixture has a fresh browser context, so nothing is cached
    // and no response can be a 304.
    const origin = new URL(baseURL ?? '').origin
    const responses: string[] = []
    const failed: string[] = []
    page.on('response', (response) => {
      if (new URL(response.url()).origin === origin) {
        responses.push(`${response.status()} ${response.url()}`)
      }
    })
    page.on('requestfailed', (request) => {
      failed.push(`${request.url()}: ${request.failure()?.errorText}`)
    })

    await page.goto('/', { waitUntil: 'load' })
    await page.evaluate(async () => {
      await document.fonts.ready
    })

    expect(responses.length).toBeGreaterThan(0)
    expect(responses.filter((line) => !line.startsWith('200 ')), responses.join('\n'))
      .toEqual([])
    expect(failed).toEqual([])
  })

  test('every internal link and asset returns 200 with a body', async ({ page, request, baseURL }) => {
    const origin = new URL(baseURL ?? '').origin
    await openPage(page, 1440)

    const fromPage = await page.evaluate(() => {
      const urls: string[] = []
      for (const link of document.querySelectorAll('link[href]')) {
        if (link.getAttribute('rel') === 'canonical') continue
        urls.push((link as HTMLLinkElement).href)
      }
      for (const element of document.querySelectorAll('img[src], script[src]')) {
        urls.push((element as HTMLImageElement | HTMLScriptElement).src)
      }
      for (const link of document.querySelectorAll('a[href]')) {
        const href = link.getAttribute('href') ?? ''
        if (href.startsWith('#') || href.startsWith('mailto:')) continue
        urls.push((link as HTMLAnchorElement).href)
      }
      return urls
    })

    // The social images point at the production domain; fetch the same
    // path from the preview instead.
    const socialImages = await page
      .locator('meta[property="og:image"], meta[name="twitter:image"]')
      .evaluateAll((metas) => metas.map((meta) => meta.getAttribute('content') ?? ''))
    expect(socialImages).toHaveLength(2)

    const paths = new Set([
      ...fromPage.map((url) => {
        expect(new URL(url).origin, `${url} is on the preview origin`).toBe(origin)
        const { pathname, search } = new URL(url)
        return pathname + search
      }),
      '/robots.txt',
      '/sitemap.xml',
      '/favicon.svg',
      '/apple-touch-icon.png',
      ...socialImages.map((url) => new URL(url).pathname),
    ])

    for (const path of paths) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      expect((await response.body()).length, `${path} body length`).toBeGreaterThan(0)
    }
  })

  test('a missing path returns 404', async ({ request }) => {
    // Proves the preview doesn't answer everything with 200, so a missing
    // file would fail the checks above.
    const response = await request.get('/this-page-does-not-exist')

    expect(response.status()).toBe(404)
  })
})
