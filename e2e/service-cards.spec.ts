import { expect, type Locator, type Page } from '@playwright/test'
import { services, servicesIntro } from '../src/data/services.ts'
import { focusedName, openPage, pressTab, test, waitForMotion } from './fixtures.ts'

// The capability grid (Capabilities Open Grid plan §4, #83), which
// replaced the service cards (#66): the heading on one line from 64em, the
// six titles at --text-xl and weight 400 at every width, wrapping to at
// most two lines from 1024px, the header (eyebrow, h2, promise line) and
// the hover and keyboard-focus treatment: the graphite 100 tint, the 1px
// teal underline and the teal arrow, with nothing moving. Runs in the
// chromium and webkit projects; the grid's rows and hairlines at each
// width are in responsive.spec.ts.

const region = (page: Page) => page.getByRole('region', { name: servicesIntro.heading })
const items = (page: Page) => region(page).locator('.services__list > li')

/** The number of lines each element's text takes. */
const lines = (locator: Locator) =>
  locator.evaluateAll((elements) =>
    elements.map((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      return new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size
    }),
  )

// The cells' h3s, not the system diagram's.
const titles = (page: Page) => region(page).locator('.services__list').getByRole('heading', { level: 3 })

/** A token resolved to its computed value for one property. */
const token = (page: Page, property: string, name: string) =>
  page.evaluate(
    ([prop, value]) => {
      const probe = document.createElement('div')
      probe.style.setProperty(prop, `var(${value})`)
      document.body.append(probe)
      const result = getComputedStyle(probe).getPropertyValue(prop)
      probe.remove()
      return result
    },
    [property, name],
  )

for (const width of [1024, 1100, 1216, 1280, 1440]) {
  test(`the heading is one line and every title at most two at ${width}px`, async ({ page }) => {
    await openPage(page, width)
    const counts = await lines(titles(page))
    expect(counts).toHaveLength(6)
    for (const count of counts) expect(count, `${width}px: ${counts}`).toBeLessThanOrEqual(2)
    expect(await lines(region(page).getByRole('heading', { level: 2 }))).toEqual([1])
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}

// W3 in the trust and lineage plan (#70): no intro paragraphs restating
// the hero, and no h2 on the page says "business intelligence"; the open
// grid plan adds the one promise line (#83).
test('the header is the eyebrow, the W3 h2 and the promise line, then the grid, and no h2 says business intelligence', async ({ page }) => {
  await openPage(page, 1440)
  const h2 = region(page).getByRole('heading', { level: 2 })
  await expect(h2).toHaveText(servicesIntro.heading)
  const intro = await h2.evaluate((heading) => ({
    children: [...heading.parentElement!.children].map((child) => child.tagName),
    eyebrow: heading.parentElement!.firstElementChild!.textContent,
    promise: heading.nextElementSibling!.textContent,
    next: heading.parentElement!.nextElementSibling!.tagName,
  }))
  expect(intro).toEqual({
    children: ['P', 'H2', 'P'],
    eyebrow: '01 — Capabilities',
    promise: servicesIntro.promise,
    next: 'OL',
  })
  const h2s = await page.getByRole('heading', { level: 2 }).allTextContents()
  expect(h2s.length).toBeGreaterThan(1)
  for (const text of h2s) expect(text).not.toMatch(/business intelligence/i)
})

test('"can trace" is teal 800 at the heading\'s size and weight 300, and nothing else in the h2 is', async ({ page }) => {
  await openPage(page, 1440)
  const accent = await token(page, 'color', '--color-accent-text')
  const look = await region(page)
    .getByRole('heading', { level: 2 })
    .evaluate((h2) => {
      const span = h2.querySelector('span')!
      const own = getComputedStyle(span)
      const parent = getComputedStyle(h2)
      return {
        text: span.textContent,
        color: own.color,
        weight: own.fontWeight,
        size: own.fontSize === parent.fontSize,
        decoration: own.textDecorationLine,
        parentColor: parent.color,
      }
    })
  expect(look).toMatchObject({ text: servicesIntro.highlight, color: accent, weight: '300', size: true, decoration: 'none' })
  expect(look.parentColor).not.toBe(accent)
})

test('the titles are --text-xl at weight 400 at every width', async ({ page }) => {
  for (const width of [320, 768, 1024, 1440]) {
    await openPage(page, width)
    const xl = await token(page, 'font-size', '--text-xl')
    const sizes = await titles(page).evaluateAll((elements) =>
      elements.map((element) => `${getComputedStyle(element).fontSize} ${getComputedStyle(element).fontWeight}`),
    )
    expect(new Set(sizes), `${width}px`).toEqual(new Set([`${xl} 400`]))
  }
})

test('below 64em the heading keeps its display size', async ({ page }) => {
  await openPage(page, 768)
  const section = await token(page, 'font-size', '--text-section')
  const heading = await page.evaluate(() => getComputedStyle(document.querySelector('.services__heading')!).fontSize)
  expect(heading).toBe(section)
})

test.describe('32px browser text', () => {
  // Set through CDP (Page.setFontSizes), Chromium only. 48em is 1536px,
  // so the grid is one column at 1440px.
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP font sizes are Chromium only')
    const session = await page.context().newCDPSession(page)
    await session.send('Page.enable')
    await session.send('Page.setFontSizes', { fontSizes: { standard: 32 } })
  })

  test('the grid is one column at 1440px, with the titles at weight 400', async ({ page }) => {
    await openPage(page, 1440)
    const m = await page.evaluate(() => ({
      columns: getComputedStyle(document.querySelector('.services__list')!).gridTemplateColumns.split(' ').length,
      weight: getComputedStyle(document.querySelector('.service-card__title')!).fontWeight,
      scroll: document.documentElement.scrollWidth - window.innerWidth,
    }))
    expect(m).toEqual({ columns: 1, weight: '400', scroll: 0 })
  })
})

/** The cell's look: its tint, box, transform and shadow, its title's
 * underline and its arrow. */
const look = (item: Locator) =>
  item.evaluate((li) => {
    const style = getComputedStyle(li)
    const link = li.querySelector('a')!
    const arrow = link.querySelector('[aria-hidden="true"]')!
    const box = li.getBoundingClientRect()
    const title = li.querySelector('h3')!.getBoundingClientRect()
    return {
      background: style.backgroundColor,
      box: [box.left, box.top + scrollY, box.width, box.height].map(Math.round),
      title: [title.left, title.top + scrollY, title.width, title.height].map(Math.round),
      transform: style.transform,
      shadow: style.boxShadow,
      underline: `${getComputedStyle(link).textDecorationLine} ${getComputedStyle(link).textDecorationColor} ${getComputedStyle(link).textDecorationThickness}`,
      arrow: `${getComputedStyle(arrow).opacity} ${getComputedStyle(arrow).color}`,
    }
  })

test.describe('the hovered or focused cell', () => {
  test.use({ reducedMotion: 'reduce' })

  test('hover and keyboard focus give the same tint, teal underline and arrow; nothing moves', async ({ page }) => {
    await openPage(page, 1440)
    await page.mouse.move(0, 0)
    const accent = await token(page, 'color', '--color-accent-text')
    const tint = await token(page, 'background-color', '--color-surface-alt')
    const item = items(page).nth(3)
    await item.scrollIntoViewIfNeeded()
    const resting = await look(item)
    expect(resting.background).toBe('rgba(0, 0, 0, 0)')
    expect(resting.arrow).toBe(`0 ${accent}`)
    expect(resting.underline).toMatch(/transparent|rgba\(0, 0, 0, 0\)/)

    await item.hover()
    await waitForMotion(page)
    const hovered = await look(item)
    expect(hovered.background).toBe(tint)
    expect(hovered.underline).toBe(`underline ${accent} 1px`)
    expect(hovered.arrow).toBe(`1 ${accent}`)
    expect({ box: hovered.box, title: hovered.title }).toEqual({ box: resting.box, title: resting.title })
    expect(hovered.transform).toBe('none')
    expect(hovered.shadow).toBe('none')
    await page.mouse.move(0, 0)
    await waitForMotion(page)
    expect(await look(item)).toEqual(resting)

    // Tab from the previous cell's title to this one's.
    await items(page).nth(2).getByRole('link').focus()
    await pressTab(page)
    expect(await focusedName(page)).toBe(services[3].name)
    await waitForMotion(page)
    const focused = await look(item)
    expect(focused).toEqual(hovered)

    // The focus ring is on the title link, around the title, not the cell.
    const ring = await page.evaluate(() => {
      const element = document.activeElement!
      const style = getComputedStyle(element)
      const box = element.getBoundingClientRect()
      const cell = element.closest('li')!.getBoundingClientRect()
      return {
        outline: `${style.outlineStyle} ${style.outlineWidth}`,
        tag: element.tagName,
        smallerThanCell: box.height < cell.height / 2,
      }
    })
    expect(ring).toEqual({ outline: 'solid 2px', tag: 'A', smallerThanCell: true })
  })

  test('only the hovered or focused cell is tinted, and the others rest', async ({ page }) => {
    await openPage(page, 1440)
    await page.mouse.move(0, 0)
    const resting = await look(items(page).nth(0))
    await items(page).nth(3).getByRole('link').focus()
    await pressTab(page)
    expect(await focusedName(page)).toBe(services[4].name)
    for (const i of [0, 1, 2, 3, 5]) {
      const other = await look(items(page).nth(i))
      expect(other.background, `cell ${i + 1}`).toBe(resting.background)
      expect(other.arrow, `cell ${i + 1}`).toBe(resting.arrow)
    }
    expect((await look(items(page).nth(4))).background).not.toBe(resting.background)
  })

  test('a mouse click leaves no tint on the cell it focused', async ({ page }) => {
    await openPage(page, 1440)
    const item = items(page).nth(1)
    // Pressed on the link but released elsewhere, so it focuses the link
    // without opening the page.
    const link = item.getByRole('link')
    const box = (await link.boundingBox())!
    await page.mouse.move(box.x + 4, box.y + 4)
    await page.mouse.down()
    await page.mouse.move(0, 0)
    await page.mouse.up()
    await waitForMotion(page)
    expect(await item.evaluate((li) => getComputedStyle(li).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  })

  test('a click anywhere in a cell outside the description and tags opens its page; their text stays selectable', async ({ page }) => {
    await openPage(page, 1440)
    const item = items(page).nth(2)
    await item.scrollIntoViewIfNeeded()
    const hits = await item.evaluate((li) => {
      const cell = li.getBoundingClientRect()
      const at = (x: number, y: number) => document.elementFromPoint(x, y)?.closest('a, p')?.className ?? ''
      const summary = li.querySelector('.service-card__summary')!.getBoundingClientRect()
      const tags = li.querySelector('.service-card__tags')!.getBoundingClientRect()
      return {
        stage: at(cell.right - 8, li.querySelector('.service-card__stage')!.getBoundingClientRect().top + 4),
        corner: at(cell.right - 4, cell.bottom - 4),
        summary: at(summary.left + 4, summary.top + 4),
        tags: at(tags.left + 4, tags.top + 4),
      }
    })
    expect(hits).toEqual({
      stage: 'service-card__link',
      corner: 'service-card__link',
      summary: 'service-card__summary',
      tags: 'service-card__tags',
    })
    // Description text is selectable with the mouse.
    const summary = item.locator('.service-card__summary')
    const box = (await summary.boundingBox())!
    await page.mouse.move(box.x + 2, box.y + 8)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + 8)
    await page.mouse.up()
    expect((await page.evaluate(() => getSelection()!.toString())).length).toBeGreaterThan(0)
    await expect(page).toHaveURL(/\/$/)

    await item.click({ position: { x: 8, y: 8 } })
    await expect(page).toHaveURL(new RegExp(`/services/${services[2].slug}$`))
  })
})

test.describe('touch', () => {
  test.use({ hasTouch: true, reducedMotion: 'reduce' })

  test('a tap on a cell opens its service page', async ({ page }) => {
    await openPage(page, 360)
    const item = items(page).nth(1)
    await item.scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
    // On the stage line, which the title link's overlay covers.
    const stage = (await item.locator('.service-card__stage').boundingBox())!
    await page.touchscreen.tap(stage.x + stage.width - 8, stage.y + stage.height / 2)
    await expect(page).toHaveURL(new RegExp(`/services/${services[1].slug}$`))
  })
})
