import type { Page, TestInfo } from '@playwright/test'
import { expect } from '@playwright/test'
import {
  WIDTHS,
  expectLanded,
  linkName,
  test,
  waitForFonts,
  waitForScrollSettle,
} from './fixtures.ts'

// The page at each width project in playwright.config.ts, in Chromium
// (width-*) and WebKit (webkit-width-*): no horizontal scrolling, the
// right navigation, the sticky header, the service grid and
// managed-services block, the solutions grid, the logo size, and every
// in-page link landing on its section below the header. Playwright loads this file once for all projects, so every test
// is declared for each width, with the width at the end of its title, and
// each project runs only its own (grep in the config). The width comes
// from the project's viewport.

// The header's four section links and its call to action; the footer's
// four section links and Contact.
const NAV = ['Services', 'Solutions', 'How We Work', 'About', 'Discuss a project'] as const
const FOOTER_NAV = ['Services', 'Solutions', 'How We Work', 'About', 'Contact'] as const
const HASH: Record<(typeof NAV)[number] | (typeof FOOTER_NAV)[number], string> = {
  Services: '#services',
  Solutions: '#solutions',
  'How We Work': '#how-we-work',
  About: '#about',
  'Discuss a project': '#contact',
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
  '#contact', // header call to action
  '#contact', // hero "Contact our team"
  '#services', // hero "See our services"
  '#services', // footer nav
  '#solutions',
  '#how-we-work',
  '#about',
  '#contact',
]

// The inline nav shows from 64em (#54): 1024px at the default text size.
const hasMenu = (width: number) => width < 1024

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

/** The header's box and computed position, in viewport coordinates. */
const headerState = (page: Page) =>
  page.getByRole('banner').evaluate((header) => {
    const { top, bottom, height } = header.getBoundingClientRect()
    return { top, bottom, height, position: getComputedStyle(header).position }
  })

/** A Main nav link, found whether or not it is currently shown. */
const mainNavLink = (page: Page, name: string) =>
  page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: linkName(name), includeHidden: true })

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

type CardBox = {
  /** The item's top, which groups the cards into grid rows. */
  row: number
  /** Card edges, relative to the top left of the card list. */
  top: number
  left: number
  width: number
  height: number
  bottom: number
  /** Offsets from the card's top border edge. */
  title: number
  label: number
  toggle: number
  titleHeight: number
  titleLineHeight: number
  titleLines: number
  toggleWidth: number
  toggleBelow: number
  listGap: number | null
  listBelow: number | null
}

const serviceList = (page: Page) =>
  page.getByRole('region', { name: 'Services' }).getByRole('list').first()

/**
 * Measures each service card (the bordered box inside each item) relative
 * to the card list, with the title, lifecycle label and toggle offsets
 * from the card's top edge. Measuring from the list rather than the page
 * keeps the values independent of anything above it: in WebKit, the
 * Services intro heading can still reflow from two lines to one after the
 * font has loaded, which moves the whole list down.
 */
const measureCards = (page: Page): Promise<CardBox[]> =>
  serviceList(page).evaluate((list) => {
    const origin = list.getBoundingClientRect()
    return [...list.children].map((item) => {
      const card = item.firstElementChild!
      const box = card.getBoundingClientRect()
      const part = (selector: string) => card.querySelector(selector)!
      const rect = (selector: string) => part(selector).getBoundingClientRect()
      const title = rect('h3')
      const toggle = rect('button')
      const panel = part('ul') as HTMLElement
      const panelBox = panel.hidden ? null : panel.getBoundingClientRect()
      const range = document.createRange()
      range.selectNodeContents(part('h3'))
      return {
        row: Math.round(item.getBoundingClientRect().top - origin.top),
        top: box.top - origin.top,
        left: box.left - origin.left,
        width: box.width,
        height: box.height,
        bottom: box.bottom - origin.top,
        title: title.top - box.top,
        label: rect('h3 + p').top - box.top,
        toggle: toggle.top - box.top,
        titleHeight: title.height,
        titleLineHeight: parseFloat(getComputedStyle(part('h3')).lineHeight),
        titleLines: new Set([...range.getClientRects()].map((line) => Math.round(line.top)))
          .size,
        toggleWidth: toggle.width,
        toggleBelow: box.bottom - toggle.bottom,
        listGap: panelBox && panelBox.top - toggle.bottom,
        listBelow: panelBox && box.bottom - panelBox.bottom,
      }
    })
  })

/**
 * Waits until the Services section's layout is settled: the boxes of its
 * headings, paragraphs, cards and buttons, in page coordinates, are the
 * same across three animation frames, twice in a row.
 */
async function waitForStableLayout(page: Page) {
  const snapshot = () =>
    page.getByRole('region', { name: 'Services' }).evaluate(async (section) => {
      const frame = () => new Promise((resolve) => requestAnimationFrame(resolve))
      const boxes = () =>
        JSON.stringify(
          [...section.querySelectorAll('h2, h3, p, li > div, button')].map((element) => {
            const box = element.getBoundingClientRect()
            return [box.left, box.top + scrollY, box.width, box.height]
          }),
        )
      const first = boxes()
      await frame()
      await frame()
      await frame()
      return first === boxes()
    })
  await expect
    .poll(async () => (await snapshot()) && (await snapshot()), {
      message: 'Services layout is stable across animation frames',
    })
    .toBe(true)
}

/** The cards grouped into grid rows, in order, as indexes into the list. */
function cardRows(cards: CardBox[]) {
  const rows = new Map<number, number[]>()
  cards.forEach((card, i) => rows.set(card.row, [...(rows.get(card.row) ?? []), i]))
  return [...rows.values()]
}

const spread = (values: number[]) => Math.max(...values) - Math.min(...values)

const serviceToggles = (page: Page) =>
  page.getByRole('button', { name: /^Typical engagements for / })

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
      test(`Menu shows the four nav links, then the call to action full width, at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        const toggle = menuButton(page)
        await expect(toggle).toBeVisible()
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        for (const name of NAV) await expect(mainNavLink(page, name)).toBeHidden()

        await toggle.click()

        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        const boxes = []
        for (const name of NAV) {
          const link = mainNavLink(page, name)
          await expect(link).toBeVisible()
          const box = await link.boundingBox()
          if (!box) throw new Error(`"${name}" has no box`)
          expect(box.width, `"${name}" width`).toBeGreaterThanOrEqual(44)
          expect(box.height, `"${name}" height`).toBeGreaterThanOrEqual(44)
          boxes.push(box)
        }
        // One below the other, the call to action last, as wide as the
        // links' list items.
        for (let i = 1; i < boxes.length; i++) {
          expect(boxes[i].y, `${NAV[i]} below ${NAV[i - 1]}`)
            .toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height)
        }
        const list = await page.locator('#main-nav-list').evaluate((element) => {
          const style = getComputedStyle(element)
          const box = element.getBoundingClientRect()
          return {
            left: box.left + parseFloat(style.paddingLeft),
            right: box.right - parseFloat(style.paddingRight),
          }
        })
        const cta = boxes.at(-1)!
        expect(Math.abs(cta.x - list.left), 'call to action left edge').toBeLessThanOrEqual(1)
        expect(Math.abs(cta.x + cta.width - list.right), 'call to action right edge')
          .toBeLessThanOrEqual(1)
      })
    } else {
      test(`logo, four nav links and the call to action on one row, no Menu, at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await expect(menuButton(page)).toBeHidden()

        const logo = await page.getByRole('link', { name: 'Fafanua Technologies' }).boundingBox()
        if (!logo) throw new Error('The logo link has no box')
        const boxes = [logo]
        for (const name of NAV) {
          const link = mainNavLink(page, name)
          await expect(link).toBeVisible()
          const box = await link.boundingBox()
          if (!box) throw new Error(`"${name}" has no box`)
          expect(box.width, `"${name}" width`).toBeGreaterThanOrEqual(44)
          expect(box.height, `"${name}" height`).toBeGreaterThanOrEqual(44)
          boxes.push(box)
        }
        const names = ['logo', ...NAV]
        // The same row: the same top. Left to right with no overlap, all
        // inside the page.
        const tops = boxes.map((box) => box.y)
        expect(Math.max(...tops) - Math.min(...tops), `tops ${tops.join(', ')}`)
          .toBeLessThanOrEqual(1)
        expect(boxes[0].x, 'logo left edge').toBeGreaterThanOrEqual(0)
        for (let i = 1; i < boxes.length; i++) {
          expect(boxes[i].x, `${names[i]} right of ${names[i - 1]}`)
            .toBeGreaterThanOrEqual(boxes[i - 1].x + boxes[i - 1].width)
        }
        const last = boxes.at(-1)!
        expect(last.x + last.width, 'call to action right edge').toBeLessThanOrEqual(width)

        // No label wraps or is clipped: each link is one line, as wide as
        // its content.
        const clipped = await page
          .getByRole('navigation', { name: 'Main' })
          .getByRole('link')
          .evaluateAll((links) =>
            links
              .filter((link) => {
                const range = document.createRange()
                range.selectNodeContents(link)
                const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.top)))
                return lines.size > 1 || link.scrollWidth > link.clientWidth
              })
              .map((link) => link.textContent),
          )
        expect(clipped).toEqual([])

        // The header is the one row: the logo link and its padding.
        const header = await headerState(page)
        expect(header.height, 'header height').toBeLessThan(2 * logo.height)
      })
    }

    test(`header sticks to the top while the page scrolls at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const atTop = await headerState(page)
      expect(atTop.position).toBe('sticky')
      expect(atTop.top).toBe(0)

      for (const target of ['#how-we-work', 'footer']) {
        await page.evaluate((selector) => {
          document.querySelector(selector)?.scrollIntoView({ block: 'start' })
        }, target)
        await waitForScrollSettle(page)
        expect(await page.evaluate(() => window.scrollY), `scrolled to ${target}`).toBeGreaterThan(0)
        const header = await headerState(page)
        expect(header.top, `header top at ${target}`).toBe(0)
        expect(header.height, `header height at ${target}`).toBe(atTop.height)
        await expect(page.getByRole('link', { name: 'Fafanua Technologies' })).toBeInViewport({
          ratio: 1,
        })
      }
    })

    test(`header is solid, with the positive logo, at every scroll position at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      // No [data-header-overlay] on the page yet (#55 adds it).
      expect(await page.locator('[data-header-overlay]').count()).toBe(0)
      const look = () =>
        page.getByRole('banner').evaluate((header) => {
          const style = getComputedStyle(header)
          return {
            background: style.backgroundColor,
            border: `${style.borderBottomWidth} ${style.borderBottomStyle} ${style.borderBottomColor}`,
            logo: header.querySelector('img')?.getAttribute('src'),
          }
        })
      const expected = await page.evaluate(() => {
        const probe = document.createElement('div')
        probe.style.backgroundColor = 'var(--color-bg)'
        probe.style.borderBottom = 'var(--border-width) solid var(--color-border)'
        document.body.append(probe)
        const style = getComputedStyle(probe)
        const value = {
          background: style.backgroundColor,
          border: `${style.borderBottomWidth} ${style.borderBottomStyle} ${style.borderBottomColor}`,
          logo: '/fafanua-logo.svg',
        }
        probe.remove()
        return value
      })

      for (const y of [0, 4, 8, 600]) {
        await page.evaluate((top) => window.scrollTo(0, top), y)
        await waitForScrollSettle(page)
        expect(await look(), `at scrollY ${y}`).toEqual(expected)
      }
    })

    test(`no text is heavier than weight 500 at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      if (hasMenu(width)) await openMenu(page)
      const heavy = await page.evaluate(() =>
        [...document.querySelectorAll('body *')]
          .filter((element) => Number(getComputedStyle(element).fontWeight) > 500)
          .map((element) => `${element.tagName} ${element.textContent?.slice(0, 30)}`),
      )
      expect(heavy).toEqual([])
    })

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

    if (columns(width) > 1) {
      test(`service card titles, labels, toggles and heights line up in each row at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await waitForStableLayout(page)
        const cards = await measureCards(page)
        const rows = cardRows(cards)
        expect(rows.map((row) => row.length)).toEqual(
          Array(6 / columns(width)).fill(columns(width)),
        )

        for (const row of rows) {
          const of = (key: keyof CardBox) => row.map((i) => cards[i][key] as number)
          const context = `row ${row.map((i) => i + 1).join(', ')}`
          expect(spread(of('title')), `${context} title tops ${of('title')}`).toBeLessThanOrEqual(1)
          expect(spread(of('label')), `${context} label tops ${of('label')}`).toBeLessThanOrEqual(1)
          expect(spread(of('toggle')), `${context} toggle tops ${of('toggle')}`).toBeLessThanOrEqual(1)
          expect(spread(of('height')), `${context} heights ${of('height')}`).toBeLessThanOrEqual(1)
        }
        for (const [i, card] of cards.entries()) {
          // A two-line title block, whether the title wraps or not.
          expect(card.titleHeight, `card ${i + 1} title height`)
            .toBeGreaterThanOrEqual(2 * card.titleLineHeight - 0.5)
          // The toggle is last, 24px padding and a 1px border above the
          // card's bottom edge, so any extra height is above it.
          expect(Math.abs(card.toggleBelow - 25), `card ${i + 1} space below toggle ${card.toggleBelow}`)
            .toBeLessThanOrEqual(1)
          // Its natural width, not stretched across the card's content box.
          expect(card.toggleWidth, `card ${i + 1} toggle width`).toBeLessThan(card.width - 50 - 1)
        }
        // Today's titles leave every label at the same offset.
        expect(spread(cards.map((card) => card.label)), 'label offsets').toBeLessThanOrEqual(1)
        // The toggles keep the one natural width.
        expect(spread(cards.map((card) => card.toggleWidth)), 'toggle widths').toBeLessThanOrEqual(1)

        // Rows are --space-6 (24px) apart.
        for (let r = 1; r < rows.length; r++) {
          const gap =
            Math.min(...rows[r].map((i) => cards[i].top)) -
            Math.max(...rows[r - 1].map((i) => cards[i].bottom))
          expect(Math.abs(gap - 24), `gap above row ${r + 1}: ${gap}`).toBeLessThanOrEqual(1)
        }
      })

      test(`every service title reserves two lines, even when all fit on one, at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        // Test-only text in the browser; services.ts is unchanged. With
        // every title on one line, only the title's own minimum height
        // keeps the two-line block.
        await serviceList(page)
          .getByRole('heading', { level: 3 })
          .evaluateAll((headings) => {
            for (const heading of headings) heading.textContent = 'Data'
          })
        await waitForStableLayout(page)
        const cards = await measureCards(page)

        for (const [i, card] of cards.entries()) {
          expect(card.titleLines, `card ${i + 1} title lines`).toBe(1)
          expect(card.titleHeight, `card ${i + 1} title height`)
            .toBeGreaterThanOrEqual(2 * card.titleLineHeight - 0.5)
        }
      })

      for (const [where, at] of [
        ['in the middle of', 1],
        ['at the start of', 0],
      ] as const) {
        test(`opening a service card ${where} a row grows only that card at ${width}px`, async ({ page }, testInfo) => {
          await open(page, testInfo, width)
          await waitForStableLayout(page)
          const before = await measureCards(page)
          const row = cardRows(before).find((cells) => cells.includes(at))!
          const toggle = serviceToggles(page).nth(at)

          await toggle.click()
          await expect(toggle).toHaveAttribute('aria-expanded', 'true')
          await waitForStableLayout(page)
          const opened = await measureCards(page)

          const card = (i: number) => `card ${i + 1}`
          expect(opened[at].height, `${card(at)} grew`).toBeGreaterThan(before[at].height + 24)
          expect(Math.abs(opened[at].top - before[at].top), `${card(at)} top`).toBeLessThanOrEqual(1)
          expect(Math.abs(opened[at].toggle - before[at].toggle), `${card(at)} toggle top`)
            .toBeLessThanOrEqual(1)
          expect(Math.abs(opened[at].listGap! - 16), `list gap ${opened[at].listGap}`)
            .toBeLessThanOrEqual(1)
          expect(Math.abs(opened[at].listBelow! - 25), `space below list ${opened[at].listBelow}`)
            .toBeLessThanOrEqual(1)
          for (const i of row.filter((cell) => cell !== at)) {
            for (const key of ['height', 'top', 'left'] as const) {
              expect(Math.abs(opened[i][key] - before[i][key]), `${card(i)} ${key}`)
                .toBeLessThanOrEqual(1)
            }
          }

          await toggle.click()
          await expect(toggle).toHaveAttribute('aria-expanded', 'false')
          await waitForStableLayout(page)
          const closed = await measureCards(page)
          expect(Math.abs(closed[at].height - before[at].height), `${card(at)} height after closing`)
            .toBeLessThanOrEqual(1)
          expect(Math.abs(closed[at].toggle - before[at].toggle), `${card(at)} toggle after closing`)
            .toBeLessThanOrEqual(1)
          for (const i of row) {
            for (const key of ['height', 'top', 'left'] as const) {
              expect(Math.abs(closed[i][key] - before[i][key]), `${card(i)} ${key} after closing`)
                .toBeLessThanOrEqual(1)
            }
          }
        })
      }
    } else {
      test(`service cards keep their natural height, with one-line titles one line tall, at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await waitForStableLayout(page)
        const cards = await measureCards(page)

        const oneLine = cards.filter((card) => card.titleLines === 1)
        expect(oneLine.length, 'cards with a one-line title').toBeGreaterThan(0)
        for (const card of oneLine) {
          expect(Math.abs(card.titleHeight - card.titleLineHeight), 'one-line title height')
            .toBeLessThanOrEqual(1)
        }
        expect(spread(cards.map((card) => card.height)), 'card heights differ')
          .toBeGreaterThan(1)
      })
    }

    if (width === 1024) {
      test(`a three-line title widens the title block for its row at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        // Test-only text in the browser; services.ts is unchanged.
        const title = serviceList(page).getByRole('heading', { level: 3 }).nth(1)
        await title.evaluate((heading) => {
          heading.textContent = 'Data Warehousing, Lakehouse & Analytics Modelling Services'
        })
        await waitForStableLayout(page)
        const cards = await measureCards(page)
        expect(cards[1].titleLines, 'the long title wraps to three lines').toBe(3)

        const [first, second] = cardRows(cards)
        for (const row of [first, second]) {
          const of = (key: keyof CardBox) => row.map((i) => cards[i][key] as number)
          expect(spread(of('label')), `label tops ${of('label')}`).toBeLessThanOrEqual(1)
          expect(spread(of('toggle')), `toggle tops ${of('toggle')}`).toBeLessThanOrEqual(1)
          expect(spread(of('height')), `heights ${of('height')}`).toBeLessThanOrEqual(1)
        }
        for (const i of first) {
          expect(cards[i].titleHeight, `card ${i + 1} title block`)
            .toBeGreaterThanOrEqual(3 * cards[i].titleLineHeight - 0.5)
        }
        for (const i of second) {
          expect(Math.abs(cards[i].titleHeight - 2 * cards[i].titleLineHeight), `card ${i + 1} title block`)
            .toBeLessThanOrEqual(1)
        }

        // Nothing overflows its card.
        const overflowing = await page
          .locator('#services .services__list > li > div')
          .evaluateAll((boxes) =>
            boxes.flatMap((box) =>
              [...box.children]
                .filter(
                  (child) =>
                    child.getBoundingClientRect().bottom > box.getBoundingClientRect().bottom + 1 ||
                    child.scrollWidth > child.clientWidth + 1,
                )
                .map((child) => child.textContent?.slice(0, 40)),
            ),
          )
        expect(overflowing).toEqual([])
      })
    }

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
      const link = await page.getByRole('link', { name: 'Fafanua Technologies' }).boundingBox()
      expect(link?.width, 'logo link width').toBeGreaterThanOrEqual(44)
      expect(link?.height, 'logo link height').toBeGreaterThanOrEqual(44)
    })

    if (width === 360) {
      test(`header is at most 96px tall (15%) at 360 x 640 at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await page.setViewportSize({ width, height: 640 })
        await waitForFonts(page)
        const header = await headerState(page)

        expect(header.position).toBe('sticky')
        expect(header.height).toBeLessThanOrEqual(96)
      })
    }
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

    for (const name of FOOTER_NAV) {
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
      // The header is sticky, so the logo is in view at the bottom, and
      // clicking it scrolls nothing before the link's own jump.
      const logo = page.getByRole('link', { name: 'Fafanua Technologies' })
      await expect(logo).toBeInViewport({ ratio: 1 })

      await logo.click()

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
