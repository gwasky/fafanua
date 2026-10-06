import { expect, type Locator, type Page } from '@playwright/test'
import { services, servicesIntro } from '../src/data/services.ts'
import { focusedName, openPage, pressTab, test, waitForMotion } from './fixtures.ts'

// The service-card enhancements (#66, V2 visual enhancement plan §8-§16):
// the Services heading on one line from 64em, the six titles on one line
// once the container reaches its full width (about 1216px) and free to
// wrap below it, and the active-card highlight on hover and, the same but
// without the lift, on focus-within, from the keyboard or a tap. Runs in
// the chromium and webkit projects; the cards' row alignment at each
// width is in responsive.spec.ts.

const region = (page: Page) => page.getByRole('region', { name: servicesIntro.heading })
const items = (page: Page) =>
  region(page)
    .getByRole('listitem')
    .filter({ has: page.getByRole('heading', { level: 3 }) })

/** The number of lines each element's text takes. */
const lines = (locator: Locator) =>
  locator.evaluateAll((elements) =>
    elements.map((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      return new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size
    }),
  )

// The cards' h3s, not the system diagram's.
const titles = (page: Page) => region(page).locator('.services__list').getByRole('heading', { level: 3 })

for (const width of [1216, 1280, 1440, 1920]) {
  test(`all six service names and the heading are one line each at ${width}px`, async ({ page }) => {
    await openPage(page, width)
    expect(await lines(titles(page))).toEqual(services.map(() => 1))
    expect(await lines(region(page).getByRole('heading', { level: 2 }))).toEqual([1])
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}

test('between 1024 and 1216px the longest names wrap to two lines rather than shrink', async ({ page }) => {
  for (const width of [1024, 1100, 1215]) {
    await openPage(page, width)
    const counts = await lines(titles(page))
    for (const count of counts) expect(count, `${width}px: ${counts}`).toBeLessThanOrEqual(2)
    // Data Warehousing & Analytics Modelling, the longest, wraps.
    if (width < 1200) expect(counts[2], `${width}px`).toBe(2)
    // The titles keep one size: 17px at weight 500.
    const sizes = await titles(page).evaluateAll((elements) =>
      elements.map((element) => `${getComputedStyle(element).fontSize} ${getComputedStyle(element).fontWeight}`),
    )
    expect(new Set(sizes)).toEqual(new Set(['17px 500']))
    expect(await lines(region(page).getByRole('heading', { level: 2 })), `${width}px heading`).toEqual([1])
  }
})

test('below 64em the titles and heading keep their display sizes', async ({ page }) => {
  await openPage(page, 768)
  const styles = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.fontSize = 'var(--text-service)'
    document.body.append(probe)
    const service = getComputedStyle(probe).fontSize
    probe.style.fontSize = 'var(--text-section)'
    const section = getComputedStyle(probe).fontSize
    probe.remove()
    const title = getComputedStyle(document.querySelector('.service-card__title')!)
    const heading = getComputedStyle(document.querySelector('.services__heading')!)
    return { service, section, title: `${title.fontSize} ${title.fontWeight}`, heading: heading.fontSize }
  })
  expect(styles.title).toBe(`${styles.service} 300`)
  expect(styles.heading).toBe(styles.section)
})

test.describe('32px browser text', () => {
  // Set through CDP (Page.setFontSizes), Chromium only. 64em is 2048px, so
  // the grid stays two columns with the larger titles.
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP font sizes are Chromium only')
    const session = await page.context().newCDPSession(page)
    await session.send('Page.enable')
    await session.send('Page.setFontSizes', { fontSizes: { standard: 32 } })
  })

  test('the grid keeps fewer columns and the larger titles at 1440px', async ({ page }) => {
    await openPage(page, 1440)
    const m = await page.evaluate(() => ({
      columns: getComputedStyle(document.querySelector('.services__list')!).gridTemplateColumns.split(' ').length,
      weight: getComputedStyle(document.querySelector('.service-card__title')!).fontWeight,
      scroll: document.documentElement.scrollWidth - window.innerWidth,
    }))
    expect(m).toEqual({ columns: 1, weight: '300', scroll: 0 })
  })
})

/** The card's look: its border, shadow and transform, and its marker's halo and label colour. */
const look = (item: Locator) =>
  item.evaluate((li) => {
    const card = li.firstElementChild!
    const style = getComputedStyle(card)
    const marker = card.querySelector('.service-card__marker')!
    return {
      border: `${style.borderTopColor} ${style.borderTopWidth}`,
      shadow: style.boxShadow,
      transform: style.transform,
      halo: getComputedStyle(marker).boxShadow,
      label: getComputedStyle(card.querySelector('.service-card__line')!).color,
      ring: getComputedStyle(marker).borderTopColor,
    }
  })

test.describe('the active card', () => {
  test.use({ reducedMotion: 'reduce' })

  test('hover and keyboard focus give the same accent highlight; focus moves nothing', async ({ page }) => {
    await openPage(page, 1440)
    await page.mouse.move(0, 0)
    const item = items(page).nth(3)
    const resting = await look(item)

    await item.hover()
    await waitForMotion(page)
    const hovered = await look(item)
    await page.mouse.move(0, 0)
    await waitForMotion(page)
    expect(await look(item)).toEqual(resting)

    // Tab from the previous card's toggle to this one's.
    await items(page).nth(2).getByRole('button').focus()
    await pressTab(page)
    expect(await focusedName(page)).toBe(`Typical engagements for ${services[3].name}`)
    await waitForMotion(page)
    const focused = await look(item)

    // The border turns the stage's colour (the marker ring's) and doubles
    // with a ring; a glow of the same colour; the marker's halo; the label
    // darkens.
    expect(focused.border).toBe(`${focused.ring} 1px`)
    expect(focused.border).not.toBe(resting.border)
    expect(focused.shadow).toMatch(/0px 0px 0px 1px/)
    expect(focused.shadow).not.toBe(resting.shadow)
    expect(focused.halo).not.toBe('none')
    expect(resting.halo).toBe('none')
    expect(focused.label).not.toBe(resting.label)
    // The same as hover, without moving.
    expect({ ...focused, transform: hovered.transform }).toEqual(hovered)
    expect(focused.transform).toBe('none')

    // The focus ring stays on the toggle.
    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement!)
      return `${style.outlineStyle} ${style.outlineWidth}`
    })
    expect(outline).toBe('solid 2px')

    // The disclosure still works, and the highlight holds while it is open.
    await page.keyboard.press('Enter')
    await expect(item.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    await expect(item.getByRole('list').last()).toBeVisible()
    expect((await look(item)).border).toBe(focused.border)
    await page.keyboard.press('Enter')
    await expect(item.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  test('only one card is active at a time, and the others rest', async ({ page }) => {
    await openPage(page, 1440)
    await page.mouse.move(0, 0)
    const resting = await look(items(page).nth(0))
    await items(page).nth(4).getByRole('button').focus()
    for (const i of [0, 1, 2, 3, 5]) {
      const other = await look(items(page).nth(i))
      expect(other.halo, `card ${i + 1}`).toBe('none')
      expect(other.shadow, `card ${i + 1}`).toBe(resting.shadow)
    }
  })
})

test.describe('touch', () => {
  test.use({ hasTouch: true, reducedMotion: 'reduce' })

  // A tapped button takes focus in Chromium, so the card highlights; WebKit
  // (Safari) does not focus a button on a tap or click, so there the open
  // disclosure is the feedback.
  test('a tap on a card\'s toggle opens it, and highlights the card where the button takes focus', async ({ page, browserName }) => {
    await openPage(page, 360)
    const item = items(page).nth(1)
    const resting = await look(item)
    await item.getByRole('button').tap()
    await expect(item.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    await expect(item.getByRole('list').last()).toBeVisible()
    if (browserName === 'chromium') {
      await expect.poll(async () => (await look(item)).border).not.toBe(resting.border)
      const tapped = await look(item)
      expect(tapped.border).toBe(`${tapped.ring} 1px`)
    }
    expect((await look(item)).transform).toBe('none')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
  })
})
