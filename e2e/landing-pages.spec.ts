import { expect, type Page } from '@playwright/test'
import { managedServices, services } from '../src/data/services.ts'
import { solutions } from '../src/data/solutions.ts'
import { expectNoAxeViolations, openPath, test, WIDTHS } from './fixtures.ts'

// The SEO landing pages (#67) on the production preview: each path
// answers 200 with the whole page in its HTML, the clean path is the only
// one, unknown paths answer 404, the sitemap and robots.txt agree, the
// homepage links to every page, and each page is usable and accessible
// at every width and with enlarged text.

const SITE = 'https://fafanua.tech'
const servicePaths = [
  ...services.map((service) => `/services/${service.slug}`),
  `/services/${managedServices.slug}`,
]
const solutionPaths = solutions.map((solution) => `/solutions/${solution.slug}`)
const PATHS = [...servicePaths, ...solutionPaths]

// The HTML as a crawler gets it: no JavaScript runs.
async function served(page: Page, path: string) {
  const response = await page.request.get(path, { maxRedirects: 0 })
  return { response, html: await response.text() }
}

const all = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].map((match) => match[1])

test.describe('served HTML', () => {
  for (const path of PATHS) {
    test(`${path} answers 200 with its own metadata and content`, async ({ page }) => {
      const { response, html } = await served(page, path)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('text/html; charset=utf-8')

      expect(all(html, /<link rel="canonical" href="([^"]*)">/g)).toEqual([`${SITE}${path}`])
      expect(all(html, /<meta property="og:url" content="([^"]*)">/g)).toEqual([`${SITE}${path}`])
      expect(all(html, /<title>([^<]*)<\/title>/g)).toHaveLength(1)
      expect(all(html, /<meta name="description" content="([^"]*)">/g)).toHaveLength(1)
      expect(html).not.toMatch(/name="robots"/)
      // One h1, and the page's sections, in the HTML itself.
      expect(html.match(/<h1\b/g)).toHaveLength(1)
      expect(html.match(/<h2\b/g)!.length).toBeGreaterThanOrEqual(7)
      // JSON-LD: the organisation and the breadcrumbs, and the service on
      // service pages, all valid JSON.
      const types = all(html, /<script type="application\/ld\+json">([^<]*)<\/script>/g).map(
        (json) => JSON.parse(json)['@type'],
      )
      expect(types.sort()).toEqual(
        path.startsWith('/services/')
          ? ['BreadcrumbList', 'Organization', 'Service']
          : ['BreadcrumbList', 'Organization'],
      )
      // Crawlable links back home and on to other pages.
      const hrefs = all(html, /<a\b[^>]*href="([^"]*)"/g)
      expect(hrefs).toContain('/')
      expect(hrefs.filter((href) => PATHS.includes(href) && href !== path).length).toBeGreaterThanOrEqual(4)
      expect(html).toContain('trusted data foundation')
    })
  }

  test('every page has a different title and description', async ({ page }) => {
    const pages = await Promise.all(PATHS.map((path) => served(page, path)))
    const titles = pages.map(({ html }) => all(html, /<title>([^<]*)<\/title>/g)[0])
    const descriptions = pages.map(({ html }) => all(html, /<meta name="description" content="([^"]*)">/g)[0])
    const home = (await served(page, '/')).html
    titles.push(all(home, /<title>([^<]*)<\/title>/g)[0])
    descriptions.push(all(home, /<meta name="description" content="([^"]*)">/g)[0])
    expect(new Set(titles).size).toBe(14)
    expect(new Set(descriptions).size).toBe(14)
  })

  test('a trailing slash or .html redirects to the clean path', async ({ page }) => {
    for (const variant of ['/solutions/health/', '/solutions/health.html']) {
      const { response } = await served(page, variant)
      expect(response.status(), variant).toBeGreaterThanOrEqual(300)
      expect(response.status(), variant).toBeLessThan(400)
      expect(new URL(response.headers()['location'], 'http://x').pathname).toBe('/solutions/health')
    }
  })

  for (const path of ['/nope', '/services/nope', '/services', '/solutions/', '/services/data-engineering']) {
    test(`${path} answers 404 with the noindex not-found page`, async ({ page }) => {
      const response = await page.request.get(path)
      expect(response.status()).toBe(404)
      expect(response.headers()['content-type']).toBe('text/html; charset=utf-8')
      const html = await response.text()
      expect(html).toContain('<meta name="robots" content="noindex">')
      expect(html).toMatch(/<h1[^>]*>Page not found<\/h1>/)
      expect(html).not.toContain('rel="canonical"')
    })
  }
})

test.describe('sitemap and robots.txt', () => {
  test('the sitemap lists the homepage and every page, each answering 200', async ({ page }) => {
    const xml = await (await page.request.get('/sitemap.xml')).text()
    const locs = all(xml, /<loc>([^<]*)<\/loc>/g)
    expect(locs).toEqual([`${SITE}/`, ...PATHS.map((path) => `${SITE}${path}`)])
    for (const loc of locs) {
      const response = await page.request.get(loc.replace(SITE, ''), { maxRedirects: 0 })
      expect(response.status(), loc).toBe(200)
    }
  })

  test('robots.txt allows everything and names the sitemap', async ({ page }) => {
    expect(await (await page.request.get('/robots.txt')).text()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://fafanua.tech/sitemap.xml\n',
    )
  })
})

test.describe('crawl from the homepage', () => {
  // Instant scrolling, and no section reveal under the pointer.
  test.use({ reducedMotion: 'reduce' })

  test('the homepage links to every landing page with an <a href>', async ({ page }) => {
    await openPath(page, '/', 1440)
    const hrefs = await page.locator('main a[href]').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    )
    for (const path of PATHS) expect(hrefs, path).toContain(path)
  })

  test('a service card title opens its page, and the header leads back to the section', async ({ page }) => {
    await openPath(page, '/', 1440)
    await page.getByRole('link', { name: services[1].name, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/services/${services[1].slug}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Data Engineering & Integration Services')

    await page.getByRole('banner').getByRole('link', { name: 'Solutions', exact: true }).click()
    await expect(page).toHaveURL(/\/#solutions$/)
  })
})

test.describe('in the browser', () => {
  // The not-found page is checked at /404, its own address, as a document
  // that answers 404 always logs a console error in the browser.
  for (const path of [servicePaths[1], '/solutions/health', '/404']) {
    for (const width of WIDTHS) {
      test(`${path} has no horizontal scroll and no axe violations at ${width}px`, async ({ page }, testInfo) => {
        await openPath(page, path, width)
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }))
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
        await expectNoAxeViolations(page, testInfo)
        await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true })
      })
    }
  }

  for (const path of PATHS) {
    test(`${path} has no horizontal scroll with 200% text at 320px`, async ({ page }) => {
      await openPath(page, path, 320)
      await page.addStyleTag({ content: 'html { font-size: 200%; }' })
      await expect
        .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
        .toBe('32px')
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
    })
  }

  test('the header hydrates: the Menu opens and closes, and the header sticks', async ({ page }) => {
    await openPath(page, '/solutions/health', 360)
    const toggle = page.getByRole('button', { name: 'Menu' })
    // Focus and Enter, as Safari does not focus a clicked button, so
    // Escape would not reach the header.
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    const height = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--header-height'),
    )
    expect(height).toMatch(/px$/)
    await page.mouse.wheel(0, 2000)
    await expect
      .poll(() => page.getByRole('banner').evaluate((header) => Math.round(header.getBoundingClientRect().top)))
      .toBe(0)
  })

  test('the footer shows the current year after hydrating', async ({ page }) => {
    await openPath(page, servicePaths[0], 1440)
    await expect(page.getByRole('contentinfo')).toContainText(
      `© ${new Date().getFullYear()} Fafanua Technologies Limited`,
    )
  })

  test('Discuss a project lands on the closing call to action of the same page', async ({ page }) => {
    await openPath(page, '/solutions/education', 1440)
    await page.getByRole('link', { name: 'Discuss a project' }).click()
    await expect(page).toHaveURL(/\/solutions\/education#contact$/)
    await expect(
      page.locator('#contact').getByRole('link', { name: '+256 752 008 822' }),
    ).toHaveAttribute('href', 'tel:+256752008822')
  })
})
