import type { Page, TestInfo } from '@playwright/test'
import { expect } from '@playwright/test'
import {
  WIDTHS,
  expectLanded,
  test,
  waitForFonts,
  waitForScrollSettle,
} from './fixtures.ts'

// The page at each width project in playwright.config.ts, in Chromium
// (width-*) and WebKit (webkit-width-*): no horizontal scrolling, the
// right navigation, the service grid and managed-services block, the
// solutions grid, the logo size, and every in-page link landing on its
// section. Playwright loads this file once for all projects, so every test
// is declared for each width, with the width at the end of its title, and
// each project runs only its own (grep in the config). The width comes
// from the project's viewport.

const NAV = ['Services', 'Solutions', 'How We Work', 'About', 'Contact'] as const
const HASH: Record<(typeof NAV)[number], string> = {
  Services: '#services',
  Solutions: '#solutions',
  'How We Work': '#how-we-work',
  About: '#about',
  Contact: '#contact',
}

// Every in-page link on the page, in document order. If one is added or
// removed, the guard test fails until the landing tests are updated.
const ANCHORS = [
  '#main', // skip link
  '#top', // logo
  '#services', // header nav
  '#solutions',
  '#how-we-work',
  '#about',
  '#contact',
  '#contact', // hero "Contact our team"
  '#services', // hero "See our services"
  '#services', // footer nav
  '#solutions',
  '#how-we-work',
  '#about',
  '#contact',
]

const hasMenu = (width: number) => width < 768

// The service and solutions grids: one column, two from 768px and three
// from 1024px.
const columns = (width: number) => (width < 768 ? 1 : width < 1024 ? 2 : 3)

/**
 * Checks the project runs at the width in the title, loads the page and
 * waits for the web font, then checks scrolling is instant: if a project
 * loses reducedMotion: 'reduce', the test fails here rather than flaking
 * on a smooth scroll later.
 */
async function open(page: Page, testInfo: TestInfo, width: number) {
  expect(testInfo.project.use.viewport?.width, 'project width').toBe(width)
  await page.goto('/')
  await waitForFonts(page)
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
  ).toBe('auto')
}

async function expectNoHorizontalScroll(page: Page) {
  await waitForFonts(page)
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))
  expect(scrollWidth, `scrollWidth ${scrollWidth}, innerWidth ${innerWidth}`)
    .toBeLessThanOrEqual(innerWidth)
}

const menuButton = (page: Page) => page.getByRole('button', { name: 'Menu' })

/** A Main nav link, found whether or not it is currently shown. */
const mainNavLink = (page: Page, name: string) =>
  page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name, exact: true, includeHidden: true })

async function openMenu(page: Page) {
  const toggle = menuButton(page)
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
}

async function expectMenuClosed(page: Page) {
  await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false')
  for (const name of NAV) await expect(mainNavLink(page, name)).toBeHidden()
}

const currentHash = (page: Page) => page.evaluate(() => location.hash)

for (const width of WIDTHS) {
  test.describe('no horizontal scroll', () => {
    test(`page as loaded, everything closed, at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)

      await expectNoHorizontalScroll(page)
    })

    test(`all six Typical engagements disclosures open at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const buttons = page.getByRole('button', { name: /^Typical engagements for / })
      await expect(buttons).toHaveCount(6)
      for (const button of await buttons.all()) {
        await button.click()
        await expect(button).toHaveAttribute('aria-expanded', 'true')
      }

      await expectNoHorizontalScroll(page)
    })

    if (hasMenu(width)) {
      test(`Menu open at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await openMenu(page)

        await expectNoHorizontalScroll(page)
      })
    }
  })

  test.describe('layout', () => {
    if (hasMenu(width)) {
      test(`Menu shows the five nav links at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        const toggle = menuButton(page)
        await expect(toggle).toBeVisible()
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        for (const name of NAV) await expect(mainNavLink(page, name)).toBeHidden()

        await toggle.click()

        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        for (const name of NAV) await expect(mainNavLink(page, name)).toBeVisible()
      })
    } else {
      test(`five nav links inline on one row, no Menu, at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await expect(menuButton(page)).toBeHidden()

        const tops: number[] = []
        for (const name of NAV) {
          const link = mainNavLink(page, name)
          await expect(link).toBeVisible()
          const box = await link.boundingBox()
          if (!box) throw new Error(`"${name}" has no box`)
          expect(box.x, `"${name}" left edge`).toBeGreaterThanOrEqual(0)
          expect(box.x + box.width, `"${name}" right edge`).toBeLessThanOrEqual(width)
          tops.push(box.y)
        }
        expect(Math.max(...tops) - Math.min(...tops), `tops ${tops.join(', ')}`)
          .toBeLessThanOrEqual(1)
      })
    }

    test(`service cards in ${columns(width)} ${columns(width) === 1 ? 'column' : 'columns'} at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const cards = page
        .getByRole('region', { name: 'Services' })
        .getByRole('listitem')
        .filter({ has: page.getByRole('heading', { level: 3 }) })
      await expect(cards).toHaveCount(6)

      const lefts = new Set<number>()
      for (const card of await cards.all()) {
        const box = await card.boundingBox()
        if (!box) throw new Error('A service card has no box')
        lefts.add(Math.round(box.x))
      }
      expect(lefts.size, `left edges ${[...lefts].join(', ')}`)
        .toBe(columns(width))
    })

    test(`service cards fit their text, with 44px toggles, all disclosures open, at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const buttons = page.getByRole('button', { name: /^Typical engagements for / })
      await expect(buttons).toHaveCount(6)
      for (const button of await buttons.all()) {
        await button.click()
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        const box = await button.boundingBox()
        if (!box) throw new Error('A toggle has no box')
        expect(box.width, 'toggle width').toBeGreaterThanOrEqual(44)
        expect(box.height, 'toggle height').toBeGreaterThanOrEqual(44)
      }

      // No text element in the section is wider than its own box, and no
      // card is wider than its grid cell.
      const overflowing = await page
        .getByRole('region', { name: 'Services' })
        .evaluate((section) =>
          [...section.querySelectorAll('h2, h3, p, li, button, li > div')]
            .filter(
              (element) =>
                element.scrollWidth > element.clientWidth + 1 ||
                element.getBoundingClientRect().right >
                  section.getBoundingClientRect().right + 1,
            )
            .map((element) => element.textContent?.slice(0, 40)),
        )
      expect(overflowing).toEqual([])
    })

    test(`managed-services block spans the grid, keeps its order and fits its text at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const section = page.getByRole('region', { name: 'Services' })
      const grid = section.getByRole('list').first()
      const block = page.locator('#managed-services')
      const capabilities = block.getByRole('list').first()
      const steps = block.getByRole('list').last().getByRole('listitem')
      await expect(capabilities.getByRole('listitem')).toHaveCount(13)
      await expect(steps).toHaveCount(3)

      // Full container width, like the card grid, and not one of its items.
      const gridBox = await grid.boundingBox()
      const blockBox = await block.boundingBox()
      if (!gridBox || !blockBox) throw new Error('The grid or block has no box')
      expect(Math.abs(blockBox.x - gridBox.x), 'left edge').toBeLessThanOrEqual(1)
      expect(Math.abs(blockBox.width - gridBox.width), 'width').toBeLessThanOrEqual(1)
      expect(blockBox.y, 'below the grid').toBeGreaterThan(gridBox.y + gridBox.height)

      // Every capability is visible, one column below 768px, two from
      // 768px and three from 1024px, flowing down each column in data
      // order.
      const boxes = await capabilities
        .getByRole('listitem')
        .evaluateAll((items) =>
          items.map((item) => {
            const box = item.getBoundingClientRect()
            return { left: Math.round(box.left), top: Math.round(box.top) }
          }),
        )
      for (const item of await capabilities.getByRole('listitem').all()) {
        await expect(item).toBeVisible()
      }
      expect(new Set(boxes.map((box) => box.left)).size, 'capability columns')
        .toBe(columns(width))
      for (let i = 1; i < boxes.length; i++) {
        const [before, after] = [boxes[i - 1], boxes[i]]
        expect(
          after.left > before.left || (after.left === before.left && after.top > before.top),
          `capability ${i + 1} follows capability ${i}`,
        ).toBe(true)
      }

      // The journey stacks below 768px and sits on one row from 768px.
      const stepBoxes = await steps.evaluateAll((items) =>
        items.map((item) => {
          const box = item.getBoundingClientRect()
          return { left: box.left, top: box.top, bottom: box.bottom }
        }),
      )
      for (let i = 1; i < stepBoxes.length; i++) {
        if (width < 768) {
          expect(stepBoxes[i].top, `step ${i + 1} below step ${i}`)
            .toBeGreaterThanOrEqual(stepBoxes[i - 1].bottom)
        } else {
          expect(Math.abs(stepBoxes[i].top - stepBoxes[0].top), `step ${i + 1} on the row`)
            .toBeLessThanOrEqual(1)
          expect(stepBoxes[i].left, `step ${i + 1} right of step ${i}`)
            .toBeGreaterThan(stepBoxes[i - 1].left)
        }
      }

      // Nothing in the block is wider than its own box or the block.
      const overflowing = await block.evaluate((root) =>
        [root, ...root.querySelectorAll('*')]
          .filter(
            (element) =>
              element.scrollWidth > element.clientWidth + 1 ||
              element.getBoundingClientRect().right > root.getBoundingClientRect().right + 1,
          )
          .map((element) => element.textContent?.slice(0, 40)),
      )
      expect(overflowing).toEqual([])
      await expectNoHorizontalScroll(page)
    })

    test(`solution cards in ${columns(width)} ${columns(width) === 1 ? 'column' : 'columns'}, even rows, fitting their text, at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const section = page.getByRole('region', { name: 'Solutions' })
      const cards = section.getByRole('list').first().locator(':scope > li')
      await expect(cards).toHaveCount(5)

      const boxes = await cards.evaluateAll((items) =>
        items.map((item) => {
          const box = item.getBoundingClientRect()
          return { left: Math.round(box.left), top: Math.round(box.top), height: box.height }
        }),
      )
      const lefts = [...new Set(boxes.map((box) => box.left))]
      expect(lefts.length, `left edges ${lefts.join(', ')}`).toBe(columns(width))

      // Filled row by row, in data order, with a short last row starting
      // at the first column; cards in a row are the same height.
      const rows = new Map<number, typeof boxes>()
      for (const box of boxes) rows.set(box.top, [...(rows.get(box.top) ?? []), box])
      expect([...rows.values()].map((row) => row.length)).toEqual(
        columns(width) === 1 ? [1, 1, 1, 1, 1] : columns(width) === 2 ? [2, 2, 1] : [3, 2],
      )
      for (const row of rows.values()) {
        expect(row[0].left, 'row starts at the first column').toBe(Math.min(...lefts))
        for (const box of row) {
          expect(Math.abs(box.height - row[0].height), 'same height as its row').toBeLessThanOrEqual(1)
        }
      }

      // No text element in the section is wider than its own box, and no
      // card goes past the section.
      const overflowing = await section.evaluate((root) =>
        [...root.querySelectorAll('h2, h3, li')]
          .filter(
            (element) =>
              element.scrollWidth > element.clientWidth + 1 ||
              element.getBoundingClientRect().right > root.getBoundingClientRect().right + 1 ||
              [...element.children].some(
                (child) =>
                  child.getBoundingClientRect().right > element.getBoundingClientRect().right + 1,
              ),
          )
          .map((element) => element.textContent?.slice(0, 40)),
      )
      expect(overflowing).toEqual([])
      await expectNoHorizontalScroll(page)
    })

    test(`header logo at least 120px wide at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const logo = page
        .getByRole('banner')
        .getByRole('img', { name: 'Fafanua Technologies' })
      await expect(logo).toBeVisible()
      const box = await logo.boundingBox()

      expect(box?.width).toBeGreaterThanOrEqual(120)
    })
  })

  test.describe('in-page links', () => {
    test(`exactly 14 in-page links, each naming one element, at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const anchors = await page.evaluate(() =>
        [...document.querySelectorAll('a[href^="#"]')].map((link) => {
          const href = link.getAttribute('href') ?? ''
          return {
            href,
            targets: document.querySelectorAll(`[id="${CSS.escape(href.slice(1))}"]`)
              .length,
          }
        }),
      )

      expect(anchors.map(({ href }) => href)).toEqual(ANCHORS)
      for (const { href, targets } of anchors) {
        expect(targets, `elements with the id in ${href}`).toBe(1)
      }
    })

    for (const name of NAV) {
      test(`header "${name}" lands on ${HASH[name]} at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        if (hasMenu(width)) await openMenu(page)

        await mainNavLink(page, name).click()

        expect(await currentHash(page)).toBe(HASH[name])
        // The menu closes before the jump, so the landing is measured
        // with it closed: a jump off by the open menu's height fails.
        if (hasMenu(width)) await expectMenuClosed(page)
        await expectLanded(page, HASH[name])
      })
    }

    for (const [name, hash] of [
      ['Contact our team', '#contact'],
      ['See our services', '#services'],
    ] as const) {
      test(`hero "${name}" lands on ${hash} at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)

        await page.getByRole('main').getByRole('link', { name, exact: true }).click()

        expect(await currentHash(page)).toBe(hash)
        await expectLanded(page, hash)
      })
    }

    for (const name of NAV) {
      test(`footer "${name}" lands on ${HASH[name]} at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        const footer = page.getByRole('contentinfo')
        await footer.scrollIntoViewIfNeeded()
        await waitForScrollSettle(page)

        await footer.getByRole('link', { name, exact: true }).click()

        expect(await currentHash(page)).toBe(HASH[name])
        await expectLanded(page, HASH[name])
      })
    }

    test(`logo lands on #top from the bottom of the page at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight),
      )
      await waitForScrollSettle(page)
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
      const logo = page.getByRole('link', { name: 'Fafanua Technologies' })
      await expect(logo).not.toBeInViewport()

      // A Playwright click would first scroll the logo into view, which
      // takes the page to the top by itself. A dispatched click follows
      // the link from where the page is, so the jump is the link's own.
      await logo.dispatchEvent('click')

      expect(await currentHash(page)).toBe('#top')
      await expectLanded(page, '#top')
    })
  })

  test.describe('screenshot', () => {
    test(`full page saved for review at ${width}px`, async ({ page, browserName }, testInfo) => {
      await open(page, testInfo, width)

      // Every project shares the output folder, so the file name carries
      // the engine as well as the width.
      await page.screenshot({
        path: `${testInfo.project.outputDir}/screenshots/${browserName}-${width}.png`,
        fullPage: true,
      })
    })
  })
}
