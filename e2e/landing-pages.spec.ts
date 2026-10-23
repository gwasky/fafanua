import { expect, type Page } from '@playwright/test'
import { managedServices, services } from '../src/data/services.ts'
import { solutionPages } from '../src/data/solutionPages.ts'
import { footerSolutions, homepageSolutions, solutions } from '../src/data/solutions.ts'
import { centreOf, expectNoAxeViolations, openPath, test, WIDTHS } from './fixtures.ts'

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
// The pages on the shared landing-page foundation (#93, #94), each with
// its closing panel's text: the plan's text and the owner's follow-up.
const PUBLIC_SECTOR = '/solutions/public-sector'
const HEALTH = '/solutions/health'
const FOUNDATION: Record<string, string> = {
  [PUBLIC_SECTOR]:
    'Which figure in your next statutory report do you trust least? Tell us about the reports leadership answers for. Then we make sure they are built on a trusted data foundation.',
  [HEALTH]:
    'Which numbers do you trust least? Tell us about the reports your branches and head office rely on. Then we make sure they are built on a trusted data foundation.',
}

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

// The site's one call to action (#68): on every landing page and the
// not-found page, the header's button goes to #contact and the closing
// button opens the email, both named "Book a data trust assessment",
// with the arrow hidden; the retired labels are gone.
test.describe('one call to action', () => {
  const CTA = /<a class="button" href="([^"]*)">Book a data trust assessment<span class="button__arrow" aria-hidden="true">→<\/span><\/a>/g

  for (const path of [...PATHS, '/nope']) {
    test(`${path} has the header and closing buttons, and no retired label`, async ({ page }) => {
      const html = await (await page.request.get(path, { maxRedirects: 0 })).text()

      if (path in FOUNDATION) {
        // The shared landing-page foundation (#93, #94): the header's
        // button, the hero's and the closing panel's, which replaces
        // Contact.
        expect(all(html, CTA)).toEqual(['#contact', 'mailto:info@fafanua.tech', 'mailto:info@fafanua.tech'])
        expect(html.match(/Book a data trust assessment/g)).toHaveLength(3)
      } else {
        expect(all(html, CTA)).toEqual(['#contact', 'mailto:info@fafanua.tech'])
        expect(html.match(/Book a data trust assessment/g)).toHaveLength(2)
      }
      for (const retired of ['Discuss a project', 'Discuss your data needs', 'Explore our capabilities']) {
        expect(html).not.toContain(retired)
      }
    })
  }

  test('the homepage header, hero, Data Trust Assessment and closing buttons share the one name', async ({ page }) => {
    await openPath(page, '/', 1440)
    const name = 'Book a data trust assessment'
    const links = page.getByRole('link', { name, exact: true })
    await expect(links).toHaveCount(4)
    await expect(page.getByRole('banner').getByRole('link', { name, exact: true })).toHaveAttribute('href', '#contact')
    await expect(
      page.getByRole('region', { name: 'Trusted Data. Better Decisions.' }).getByRole('link', { name, exact: true }),
    ).toHaveAttribute('href', '#contact')
    // The Data Trust Assessment's one link, its button (#71).
    await expect(
      page.getByRole('region', { name: 'Know where every number comes from.' }).getByRole('link'),
    ).toHaveAttribute('href', '#contact')
    await expect(page.locator('#contact').getByRole('link', { name, exact: true })).toHaveAttribute(
      'href',
      'mailto:info@fafanua.tech',
    )
    for (const retired of ['Discuss a project', 'Discuss your data needs']) {
      await expect(page.getByText(retired)).toHaveCount(0)
    }
    // Restored on #83 as the hero's text link: once on the homepage, in
    // the hero, to #capabilities.
    await expect(page.getByText('Explore our capabilities')).toHaveCount(1)
    await expect(
      page
        .getByRole('region', { name: 'Trusted Data. Better Decisions.' })
        .getByRole('link', { name: 'Explore our capabilities', exact: true }),
    ).toHaveAttribute('href', '#capabilities')
  })
})

// The closing section's supporting line (#74, W9 in the trust and lineage
// plan): every pre-rendered landing page and the not-found page serve it
// in their HTML, without the line it replaces; the homepage, rendered in
// the browser, shows it in #contact.
test.describe('closing supporting line', () => {
  const LINE = 'Which number do you trust least? Tell us about the reports and figures your organisation relies on.'

  for (const path of [...PATHS, '/nope']) {
    test(`${path} has the W9 line in the closing section`, async ({ page }) => {
      const html = await (await page.request.get(path, { maxRedirects: 0 })).text()

      if (path in FOUNDATION) {
        // Its closing panel's own text (#93, #94: plan section 4, with the
        // owner's follow-up), not W9's.
        expect(html.split(`<p class="sector-closing__body">${FOUNDATION[path]}</p>`)).toHaveLength(2)
        expect(html).not.toContain(LINE)
      } else {
        expect(html.split(`<p class="contact__text">${LINE}</p>`)).toHaveLength(2)
      }
      expect(html).not.toContain('reporting challenges')
    })
  }

  test('the homepage shows it in #contact, between the heading and the button', async ({ page }) => {
    await openPath(page, '/', 1440)
    const contact = page.locator('#contact')
    await expect(contact.locator('p')).toHaveText([LINE])
    await expect(page.getByText('reporting challenges')).toHaveCount(0)
    await expect(contact.getByRole('heading', { level: 2 })).toHaveText(
      'Let\u2019s build a data foundation your organisation can trust.',
    )
  })
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

  // Since #73 three sector pages are linked from the Solutions rows in
  // main and the other three from the footer's "More sectors" line (W7).
  test('the homepage links to every landing page with an <a href>', async ({ page }) => {
    await openPath(page, '/', 1440)
    const hrefs = (selector: string) =>
      page.locator(`${selector} a[href]`).evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    const [main, footer] = await Promise.all([hrefs('main'), hrefs('footer')])
    for (const path of PATHS) expect([...main, ...footer], path).toContain(path)
    for (const path of servicePaths) expect(main, path).toContain(path)
    for (const solution of homepageSolutions) expect(main).toContain(`/solutions/${solution.slug}`)
    expect(footer.filter((href) => href?.startsWith('/solutions/'))).toEqual(
      footerSolutions.map((solution) => `/solutions/${solution.slug}`),
    )
  })

  // The Solutions rows are links since #89: a click anywhere in a row,
  // here on its tags (under the link's overlay), opens the sector's page.
  for (const [index, solution] of homepageSolutions.entries()) {
    test(`a click on the ${solution.title} row's tags opens /solutions/${solution.slug}`, async ({ page }) => {
      await openPath(page, '/', 1440)
      const tags = page.locator('#solutions .solution-row').nth(index).locator('.solution-row__tags')
      await expect(tags).toHaveText(solution.summary.join(' · '))
      const { x, y } = await centreOf(tags)
      await page.mouse.click(x, y)

      await expect(page).toHaveURL(new RegExp(`/solutions/${solution.slug}$`))
      // The page's h1, from its data: the foundation hero's (Health, #94)
      // or the sector's heading.
      const copy = solutionPages[solution.id]
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        copy.layout === 'sector' ? copy.hero.heading : solution.heading,
      )
      if (solution.id === 'health') {
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Health data you can trace.')
      }
    })

    // What the homepage row's accordion used to hold (#89, do-first
    // check 1): the sector's seven themes, on its page under "Reporting and
    // analytics use cases", in data order.
    // The Health plan removes the use-case list (#94, owner note 9): its
    // page has no #use-cases and none of the seven themes.
    if (solutionPages[solution.id].layout === 'sector') {
      test(`/solutions/${solution.slug} no longer lists the seven themes, as its plan removes them`, async ({ page }) => {
        await openPath(page, `/solutions/${solution.slug}`, 1440)
        await expect(page.locator('#use-cases')).toHaveCount(0)
        await expect(page.getByRole('heading', { name: 'Reporting and analytics use cases' })).toHaveCount(0)
        expect(solution.themes).toHaveLength(7)
        const text = await page.getByRole('main').innerText()
        for (const theme of solution.themes) expect(text, theme).not.toContain(theme)
      })
      continue
    }
    test(`/solutions/${solution.slug} lists the seven themes the homepage row used to hold`, async ({ page }) => {
      await openPath(page, `/solutions/${solution.slug}`, 1440)
      const section = page.locator('#use-cases')
      await expect(section.getByRole('heading', { level: 2 })).toHaveText('Reporting and analytics use cases')
      await expect(section.getByRole('listitem')).toHaveText([...solution.themes])
      expect(solution.themes).toHaveLength(7)
    })
  }

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
  for (const path of [servicePaths[1], HEALTH, PUBLIC_SECTOR, '/404']) {
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

  // The shared landing-page foundation (#93, #94) with 200% text at the
  // other widths too.
  for (const path of [PUBLIC_SECTOR, HEALTH]) for (const width of [390, 1024, 1440]) {
    test(`${path} has no horizontal scroll with 200% text at ${width}px`, async ({ page }) => {
      await openPath(page, path, width)
      await page.addStyleTag({ content: 'html { font-size: 200%; }' })
      await expect
        .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
        .toBe('32px')
      const m = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        // Everything in main, measured on its own.
        mainRight: Math.max(
          ...[...document.querySelectorAll('main, main *')].map((element) => element.getBoundingClientRect().right),
        ),
        mainScroll: document.querySelector('main')!.scrollWidth - document.querySelector('main')!.clientWidth,
      }))
      expect(m.mainRight, JSON.stringify(m)).toBeLessThanOrEqual(m.innerWidth)
      expect(m.mainScroll, JSON.stringify(m)).toBeLessThanOrEqual(0)
      // At 1024px with 200% page text the header's inline navigation is
      // wider than the page on every page (#65, out of scope), so the page
      // itself is checked at the other widths; main is checked above.
      if (width !== 1024) expect(m.scrollWidth, JSON.stringify(m)).toBeLessThanOrEqual(m.innerWidth)
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

  // The footer's "More sectors" line (#73) on every landing page and the
  // not-found page: in the pre-rendered HTML, so a crawler finds it, and
  // after the footer hydrates (with no console error, from the fixture),
  // where each link opens its page.
  for (const path of [...PATHS, '/404']) {
    test(`${path} links the footer's "More sectors" line to the other sectors`, async ({ page }) => {
      const { html } = await served(page, path)
      const footerHtml = html.slice(html.indexOf('<footer'))
      for (const solution of footerSolutions) {
        expect(footerHtml).toContain(`href="/solutions/${solution.slug}"`)
      }
      expect(footerHtml).toContain('More sectors')

      await openPath(page, path, 1440)
      const footer = page.getByRole('contentinfo')
      await expect(footer.getByText('More sectors', { exact: true })).toBeVisible()
      const links = footer.locator('.site-footer__sectors a')
      await expect(links).toHaveText(footerSolutions.map((solution) => solution.heading))
      expect(await links.evaluateAll((all) => all.map((link) => link.getAttribute('href')))).toEqual(
        footerSolutions.map((solution) => `/solutions/${solution.slug}`),
      )
      await expect(footer.getByRole('navigation', { name: 'Footer' }).getByRole('link')).toHaveCount(5)
    })
  }

  test('a "More sectors" link opens its sector page, which answers 200', async ({ page }) => {
    await openPath(page, '/solutions/health', 1440)
    const target = footerSolutions[1]
    const [response] = await Promise.all([
      page.waitForResponse((r) => new URL(r.url()).pathname === `/solutions/${target.slug}`),
      page.getByRole('contentinfo').getByRole('link', { name: target.heading, exact: true }).click(),
    ])
    expect(response.status()).toBe(200)
    await expect(page).toHaveURL(new RegExp(`/solutions/${target.slug}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(target.heading)
  })

  test('the footer shows the current year after hydrating', async ({ page }) => {
    await openPath(page, servicePaths[0], 1440)
    await expect(page.getByRole('contentinfo')).toContainText(
      `© ${new Date().getFullYear()} Fafanua Technologies Limited`,
    )
  })

  test('Book a data trust assessment lands on the closing call to action of the same page', async ({ page }) => {
    await openPath(page, '/solutions/education', 1440)
    await page.getByRole('banner').getByRole('link', { name: 'Book a data trust assessment' }).click()
    await expect(page).toHaveURL(/\/solutions\/education#contact$/)
    await expect(
      page.locator('#contact').getByRole('link', { name: '+256 752 008 822' }),
    ).toHaveAttribute('href', 'tel:+256752008822')
  })
})
