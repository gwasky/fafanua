import type { Page, TestInfo } from '@playwright/test'
import { expect } from '@playwright/test'
import { managedServices, servicesIntro } from '../src/data/services.ts'
import { solutions } from '../src/data/solutions.ts'
import {
  WIDTHS,
  expectLanded,
  linkName,
  test,
  waitForFonts,
  waitForLanding,
  waitForScrollSettle,
} from './fixtures.ts'
import { expectFlow, flowList, flowProblems, measureFlow } from './systemFlow.ts'

// The page at each width project in playwright.config.ts, in Chromium
// (width-*) and WebKit (webkit-width-*): no horizontal scrolling, the
// right navigation, the sticky header, the service grid, the Managed
// Services panel, the Solutions rows, the How We Work timeline, the logo
// size, and every in-page
// link landing on its section below the header. Playwright loads this
// file once for all projects, so every test
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
  '#contact', // hero "Discuss your data needs"
  '#services', // hero "Explore our capabilities"
  '#services', // footer nav
  '#solutions',
  '#how-we-work',
  '#about',
  '#contact',
]

// The Services section is named by its h2, the approved intro heading
// (#56).
const servicesRegion = (page: Page) =>
  page.getByRole('region', { name: servicesIntro.heading })

// The inline nav shows from 64em (#54): 1024px at the default text size.
const hasMenu = (width: number) => width < 1024

// The service grid: one column, two from 768px and three from 1024px.
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
  description: number
  tags: number
  toggle: number
  titleHeight: number
  titleLineHeight: number
  titleLines: number
  toggleWidth: number
  toggleBelow: number
  listGap: number | null
  listBelow: number | null
}

// The card grid: the section's one list with headings in it (the
// lifecycle rail and the tag lists have none).
const serviceList = (page: Page) =>
  servicesRegion(page)
    .getByRole('list')
    .filter({ has: page.getByRole('heading', { level: 3 }) })

// The Managed Services section is named by its h2, the plan V2 §10
// heading (#58).
const managedRegion = (page: Page) =>
  page.getByRole('region', { name: managedServices.sectionHeading })

/**
 * Text in the Managed Services panel that does not fit: an element wider
 * than its own box or reaching past the panel's content box, and, unless
 * `words` is false, a word broken across two lines.
 */
const managedOverflow = (page: Page, { words = true } = {}) =>
  managedRegion(page)
    .locator('.surface-dark')
    .evaluate((panel, checkWords) => {
      const style = getComputedStyle(panel)
      const { left, right } = panel.getBoundingClientRect()
      const inner = {
        left: left + parseFloat(style.paddingLeft) - 1,
        right: right - parseFloat(style.paddingRight) + 1,
      }
      const problems = [...panel.querySelectorAll('*')]
        .filter((element) => {
          const box = element.getBoundingClientRect()
          return (
            element.scrollWidth > element.clientWidth + 1 ||
            (box.width > 0 && (box.left < inner.left || box.right > inner.right))
          )
        })
        .map((element) => `overflows: ${element.textContent?.slice(0, 40)}`)
      if (checkWords) {
        const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT)
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent ?? ''
          for (const match of text.matchAll(/\S+/g)) {
            const range = document.createRange()
            range.setStart(node, match.index)
            range.setEnd(node, match.index + match[0].length)
            const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)))
            if (tops.size > 1) problems.push(`broken: ${match[0]}`)
          }
        }
      }
      return problems
    }, words)

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
      // The engagements panel has an id; the tag list does not.
      const panel = part('ul[id]') as HTMLElement
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
        description: rect('h3 + p + p').top - box.top,
        tags: rect('ul:not([id])').top - box.top,
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
    servicesRegion(page).evaluate(async (section) => {
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

// The Solutions section's five row buttons (#59), in order.
const sectorButtons = (page: Page) =>
  page.getByRole('region', { name: 'Solutions' }).getByRole('button')

/** Opens every Solutions row with a click on its title. */
async function openAllSectors(page: Page) {
  for (const button of await sectorButtons(page).all()) {
    // The title, not the button's centre: from 1024px the summary sits
    // over the middle of the button and does not toggle the row.
    await button.locator('.solution-row__title').click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
  }
}

type Box = { left: number; right: number; top: number; bottom: number; height: number }

type SectorBox = {
  row: Box
  button: Box
  number: Box
  title: Box
  chevron: Box
  summary: Box
  panel: Box
  panelHidden: boolean
  summaryLines: number
  titleLineHeight: number
  themes: { text: string; left: number; top: number; bottom: number }[]
  style: { background: string; shadow: string; radius: string; sides: string; top: string }
}

/**
 * Measures each Solutions row: its box and its parts' boxes, the number
 * of lines its summary takes, its theme items and its own decoration.
 */
const measureSectors = (page: Page) =>
  page
    .getByRole('region', { name: 'Solutions' })
    .getByRole('list')
    .first()
    .evaluate((list) => {
      const box = (element: Element): Box => {
        const { left, right, top, bottom, height } = element.getBoundingClientRect()
        return { left, right, top, bottom, height }
      }
      const border = (style: CSSStyleDeclaration, side: 'top' | 'bottom') =>
        `${style.getPropertyValue(`border-${side}-width`)} ${style.getPropertyValue(`border-${side}-style`)} ${style.getPropertyValue(`border-${side}-color`)}`
      // The border token, resolved.
      const probe = document.createElement('div')
      probe.style.border = '1px solid var(--color-border)'
      document.body.append(probe)
      const hairline = border(getComputedStyle(probe), 'top')
      probe.remove()
      return {
        hairline,
        listBorder: border(getComputedStyle(list), 'bottom'),
        listHeight: list.getBoundingClientRect().height,
        rows: [...list.children].map((row): SectorBox => {
          const part = (selector: string) => row.querySelector(selector)!
          const panel = part('[id]')
          const style = getComputedStyle(row)
          const summaryItems = [...part('h3 + ul').children]
          return {
            row: box(row),
            button: box(part('button')),
            number: box(part('.solution-row__number')),
            title: box(part('.solution-row__title')),
            chevron: box(part('svg')),
            summary: box(part('h3 + ul')),
            panel: box(panel),
            panelHidden: panel.hasAttribute('hidden'),
            summaryLines: new Set(summaryItems.map((item) => Math.round(item.getBoundingClientRect().top))).size,
            titleLineHeight: parseFloat(getComputedStyle(part('h3')).lineHeight),
            themes: [...panel.querySelectorAll('li')].map((item) => {
              const { left, top, bottom } = item.getBoundingClientRect()
              return { text: item.textContent ?? '', left, top, bottom }
            }),
            style: {
              background: style.backgroundColor,
              shadow: style.boxShadow,
              radius: style.borderTopLeftRadius,
              sides: `${style.borderLeftWidth} ${style.borderRightWidth}`,
              top: border(style, 'top'),
            },
          }
        }),
      }
    })

/**
 * Text in the Solutions section that does not fit: an element wider than
 * its own box, or reaching past the section's content box.
 */
const sectorOverflow = (page: Page) =>
  page.getByRole('region', { name: 'Solutions' }).evaluate((section) => {
    const container = section.firstElementChild!
    const style = getComputedStyle(container)
    const { left, right } = container.getBoundingClientRect()
    const inner = {
      left: left + parseFloat(style.paddingLeft) - 1,
      right: right - parseFloat(style.paddingRight) + 1,
    }
    return [...section.querySelectorAll('h2, h3, button, span, ul, li, p, svg')]
      .filter((element) => {
        const box = element.getBoundingClientRect()
        return (
          element.scrollWidth > element.clientWidth + 1 ||
          (box.width > 0 && (box.left < inner.left || box.right > inner.right))
        )
      })
      .map((element) => `${element.tagName}: ${element.textContent?.slice(0, 40)}`)
  })

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

    test(`all five Solutions rows open at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      await openAllSectors(page)

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

    test(`header is transparent over the hero at the top and solid from 8px at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      // The dark hero is the overlay section (#55).
      await expect(page.locator('main > [data-header-overlay]')).toHaveCount(1)
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

      const transparent = {
        background: 'rgba(0, 0, 0, 0)',
        border: `${expected.border.split(' ').slice(0, 2).join(' ')} rgba(0, 0, 0, 0)`,
        logo: '/fafanua-logo-reversed.svg',
      }

      // Below the 8px threshold transparent, from it solid, and
      // transparent again back at the top.
      for (const [y, want] of [
        [0, transparent],
        [4, transparent],
        [8, expected],
        [600, expected],
        [0, transparent],
      ] as const) {
        await page.evaluate((top) => window.scrollTo(0, top), y)
        await waitForScrollSettle(page)
        await expect.poll(look, { message: `at scrollY ${y}` }).toEqual(want)
      }
    })

    // The dark hero (#55): from 64em 80-90% of the viewport's height
    // (85svh); below it, its natural height, with both calls to action on
    // the first screen (the projects' viewport is 800px tall).
    test(`hero height and calls to action at scroll 0 at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const m = await page.evaluate(() => {
        const hero = document.querySelector('main > [data-header-overlay]')!
        const [primary, secondary] = [...hero.querySelectorAll('a')].map((link) => link.getBoundingClientRect())
        const { top, height } = hero.getBoundingClientRect()
        return {
          top,
          height,
          minBlockSize: getComputedStyle(hero).minBlockSize,
          primaryBottom: primary.bottom,
          secondaryBottom: secondary.bottom,
          headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
          viewport: window.innerHeight,
        }
      })
      const detail = JSON.stringify(m)

      expect(m.top, detail).toBe(0)
      if (width >= 1024) {
        expect(m.height / m.viewport, detail).toBeGreaterThanOrEqual(0.8)
        expect(m.height / m.viewport, detail).toBeLessThanOrEqual(0.9)
      } else {
        expect(m.minBlockSize, detail).toBe('0px')
      }
      expect(m.primaryBottom, detail).toBeLessThanOrEqual(m.viewport)
      expect(m.secondaryBottom, detail).toBeLessThanOrEqual(m.viewport)
      for (const name of ['Discuss your data needs', 'Explore our capabilities']) {
        await expect(page.getByRole('main').getByRole('link', { name, exact: true })).toBeInViewport({ ratio: 1 })
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
      const cards = servicesRegion(page)
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
      const overflowing = await servicesRegion(page)
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
          expect(spread(of('description')), `${context} description tops ${of('description')}`).toBeLessThanOrEqual(1)
          expect(spread(of('tags')), `${context} tag list tops ${of('tags')}`).toBeLessThanOrEqual(1)
          expect(spread(of('toggle')), `${context} toggle tops ${of('toggle')}`).toBeLessThanOrEqual(1)
          expect(spread(of('height')), `${context} heights ${of('height')}`).toBeLessThanOrEqual(1)
        }
        for (const [i, card] of cards.entries()) {
          // The tags sit between the description and the toggle.
          expect(card.tags, `card ${i + 1} tags below the description`).toBeGreaterThan(card.description)
          expect(card.toggle, `card ${i + 1} toggle below the tags`).toBeGreaterThan(card.tags)
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
        // At --text-service (#56) no real title fits on one line at 320px,
        // so the first card gets a short test-only title; services.ts is
        // unchanged.
        await serviceList(page)
          .getByRole('heading', { level: 3 })
          .first()
          .evaluate((heading) => {
            heading.textContent = 'Data'
          })
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
          heading.textContent = 'Data Warehousing, Lakehouse & Analytics Modelling'
        })
        await waitForStableLayout(page)
        const cards = await measureCards(page)
        expect(cards[1].titleLines, 'the long title wraps to three lines').toBe(3)

        const [first, second] = cardRows(cards)
        for (const row of [first, second]) {
          const of = (key: keyof CardBox) => row.map((i) => cards[i][key] as number)
          expect(spread(of('label')), `label tops ${of('label')}`).toBeLessThanOrEqual(1)
          expect(spread(of('tags')), `tag list tops ${of('tags')}`).toBeLessThanOrEqual(1)
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

    // The lifecycle rail (#56): one row of six from 768px, a vertical
    // list below it, never a scroll container, each item one line.
    test(`lifecycle rail is ${width < 768 ? 'vertical' : 'one row'}, unclipped, with no scroll container, at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const rail = servicesRegion(page).getByRole('list').first()
      const items = rail.getByRole('listitem')
      await expect(items).toHaveCount(6)
      await expect(rail).toContainText('Design')

      const m = await rail.evaluate((list) => {
        const box = list.getBoundingClientRect()
        const lineHeight = (element: Element) => parseFloat(getComputedStyle(element).lineHeight)
        return {
          overflowX: getComputedStyle(list).overflowX,
          scroll: list.scrollWidth - list.clientWidth,
          left: box.left,
          right: box.right,
          items: [...list.children].map((item) => {
            const b = item.getBoundingClientRect()
            const label = item.lastElementChild!
            const range = document.createRange()
            range.selectNodeContents(label)
            return {
              left: b.left,
              right: b.right,
              top: b.top,
              bottom: b.bottom,
              height: b.height,
              lineHeight: lineHeight(item),
              labelLines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
              labelClipped: label.scrollWidth > label.clientWidth + 1,
              labelRight: label.getBoundingClientRect().right,
            }
          }),
        }
      })
      const detail = JSON.stringify(m)

      expect(m.overflowX, detail).toBe('visible')
      expect(m.scroll, detail).toBeLessThanOrEqual(0)
      for (const [i, item] of m.items.entries()) {
        expect(item.labelLines, `item ${i + 1} label lines`).toBe(1)
        expect(item.labelClipped, `item ${i + 1} label clipped`).toBe(false)
        expect(item.left, `item ${i + 1} left`).toBeGreaterThanOrEqual(m.left - 1)
        expect(item.labelRight, `item ${i + 1} label right`).toBeLessThanOrEqual(m.right + 1)
        // Subordinate to the cards: no taller than two lines of --text-sm.
        expect(item.height, `item ${i + 1} height`).toBeLessThanOrEqual(2 * item.lineHeight)
      }
      for (let i = 1; i < m.items.length; i++) {
        const [before, after] = [m.items[i - 1], m.items[i]]
        if (width < 768) {
          expect(after.top, `item ${i + 1} below item ${i}`).toBeGreaterThanOrEqual(before.bottom)
          expect(Math.abs(after.left - before.left), `item ${i + 1} left edge`).toBeLessThanOrEqual(1)
        } else {
          expect(Math.abs(after.top - before.top), `item ${i + 1} on the row`).toBeLessThanOrEqual(1)
          expect(after.left, `item ${i + 1} right of item ${i}`).toBeGreaterThanOrEqual(before.right - 1)
        }
      }
      // The rail sits between the intro and the card grid.
      const railBox = await rail.boundingBox()
      const gridBox = await serviceList(page).boundingBox()
      const heading = await servicesRegion(page).getByRole('heading', { level: 2 }).boundingBox()
      if (!railBox || !gridBox || !heading) throw new Error('The rail, grid or heading has no box')
      expect(railBox.y).toBeGreaterThan(heading.y + heading.height)
      expect(gridBox.y).toBeGreaterThan(railBox.y + railBox.height)
      await expectNoHorizontalScroll(page)
    })

    // The rail's connector (#56 QA): the rail is either one row of six or
    // one vertical column, never a wrapped row, and every pair of stages
    // is joined by a graphite 200 rule at least 8px (--space-2) long that
    // runs from just after one stage to just before the next. Measured at
    // the default text size across the widths where the six items are
    // tightest (a 1fr column once left Connect to Model with no line from
    // 768 to 775px), and with 150% and 200% page text, which the 48em
    // media query does not follow (a flex-wrap fallback once left the rail
    // in two or three unjoined rows). Chromium also checks 32px browser
    // text, set through CDP. Run from the 768px projects, in Chromium and
    // WebKit.
    if (width === 768) {
      test(`the lifecycle rail is one joined row or one joined column, with default and enlarged text, at ${width}px`, async ({ page, browserName }, testInfo) => {
        await open(page, testInfo, width)
        const rail = servicesRegion(page).getByRole('list').first()
        const measure = () =>
          rail.evaluate((list) => {
            const probe = document.createElement('div')
            probe.style.borderTop = 'var(--border-width) solid var(--color-border)'
            probe.style.width = 'var(--space-2)'
            document.body.append(probe)
            const want = {
              border: `${getComputedStyle(probe).borderTopWidth} solid ${getComputedStyle(probe).borderTopColor}`,
              min: parseFloat(getComputedStyle(probe).width),
            }
            probe.remove()
            const items = [...list.children]
            const markers = items.map((item) => item.firstElementChild!.getBoundingClientRect())
            const rows = new Set(markers.map((marker) => Math.round(marker.top))).size
            const columns = new Set(markers.map((marker) => Math.round(marker.left))).size
            const horizontal = columns > 1
            const segments = items.slice(0, -1).map((item, i) => {
              const after = getComputedStyle(item, '::after')
              const marker = markers[i]
              const next = markers[i + 1]
              const label = item.lastElementChild!.getBoundingClientRect()
              if (!horizontal) {
                // Vertical: from below this marker to the top of the next.
                const top = item.getBoundingClientRect().top + parseFloat(after.top)
                return {
                  content: after.content,
                  border: `${after.borderLeftWidth} ${after.borderLeftStyle} ${after.borderLeftColor}`,
                  length: parseFloat(after.height),
                  startGap: top - marker.bottom,
                  endGap: next.top - (top + parseFloat(after.height)),
                }
              }
              // The item's flex gap and the rule's own margin come first.
              const start =
                label.right + parseFloat(getComputedStyle(item).columnGap) + parseFloat(after.marginLeft)
              const end = start + parseFloat(after.width)
              return {
                content: after.content,
                border: `${after.borderTopWidth} ${after.borderTopStyle} ${after.borderTopColor}`,
                length: parseFloat(after.width),
                startGap: start - label.right,
                // Always measured to the next marker: on a wrapped row it
                // is on another line, and this fails.
                endGap: next.left - end,
              }
            })
            const box = list.getBoundingClientRect()
            return {
              want,
              rows,
              columns,
              horizontal,
              segments,
              // The rail stays inside its own box. (The page as a whole is
              // not checked here: with 200% page text the header's inline
              // nav overflows at 1024px, which is outside #56.)
              overflow:
                list.scrollWidth - list.clientWidth +
                Math.max(0, ...items.map((item) => item.getBoundingClientRect().right - box.right)),
            }
          })

        const check = async (context: string, { row }: { row?: boolean } = {}) => {
          // Chromium can report a pseudo-element's previous container-query
          // styles until the next rendered frame after a resize or a text
          // size change, so wait two frames before measuring.
          await page.evaluate(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              ),
          )
          const m = await measure()
          const shape = `${context}: ${m.rows} rows, ${m.columns} columns`
          // One row of six, or one column of six: never both several rows
          // and several columns.
          expect.soft(m.rows === 1 || m.columns === 1, shape).toBe(true)
          if (row !== undefined) expect.soft(m.horizontal, `${shape}, one row expected: ${row}`).toBe(row)
          expect.soft(m.segments, context).toHaveLength(5)
          for (const [i, segment] of m.segments.entries()) {
            const detail = `${context}, stage ${i + 1} to ${i + 2}: ${JSON.stringify(segment)}`
            // Soft, so a failure lists every segment and width.
            expect.soft(segment.content, detail).not.toBe('none')
            expect.soft(segment.border, detail).toBe(m.want.border)
            expect.soft(segment.length, detail).toBeGreaterThanOrEqual(m.want.min - 0.5)
            // It starts just after the label (or marker) and runs up to the
            // next marker: no gap wider than --space-2 at either end.
            expect.soft(segment.startGap, detail).toBeLessThanOrEqual(m.want.min + 1)
            expect.soft(segment.endGap, detail).toBeLessThanOrEqual(m.want.min + 1)
            expect.soft(segment.endGap, detail).toBeGreaterThanOrEqual(-1)
          }
          expect.soft(m.overflow, `${context} rail overflow`).toBeLessThanOrEqual(1)
        }

        const cases: [string, number[]][] = [
          ['100%', [768, 775, 800, 1023, 1024, 1440]],
          ['150%', [768, 1024, 1440]],
          ['200%', [768, 790, 1024, 1440]],
        ]
        const style = await page.addStyleTag({ content: '/* page text size */' })
        for (const [text, widths] of cases) {
          await style.evaluate((element, size) => {
            element.textContent = `html { font-size: ${size}; }`
          }, text)
          for (const w of widths) {
            await page.setViewportSize({ width: w, height: 800 })
            // At the default text size the rail is one row from 48em.
            await check(`${w}px, ${text} page text`, text === '100%' ? { row: true } : {})
          }
        }

        if (browserName === 'chromium') {
          await style.evaluate((element) => {
            element.textContent = ''
          })
          const session = await page.context().newCDPSession(page)
          await session.send('Page.enable')
          await session.send('Page.setFontSizes', { fontSizes: { standard: 32 } })
          for (const w of [768, 1024, 1440, 1600]) {
            await page.setViewportSize({ width: w, height: 800 })
            // 48em is 1536px here, so the rail is vertical below it.
            await check(`${w}px, 32px browser text`, w < 1536 ? { row: false } : {})
          }
        }
      })
    }

    // The positioning block (#56): two columns from 64em, the statement
    // first; stacked below it. Its bottom padding is the only gap above
    // the Services eyebrow, and no word breaks mid-word.
    test(`positioning section layout, spacing and wrapping at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const m = await page.evaluate(() => {
        const block = document.querySelector('main > div:not([id])')!
        const [statement, support] = [...block.querySelectorAll('p')]
        const eyebrow = document.querySelector('#services p')!
        const box = (element: Element) => element.getBoundingClientRect()
        const probe = document.createElement('div')
        probe.style.paddingTop = 'var(--space-section)'
        document.body.append(probe)
        const section = parseFloat(getComputedStyle(probe).paddingTop)
        probe.remove()
        // A word broken across lines leaves a line that starts or ends
        // mid-word: compare each line's text with the paragraph's words.
        const brokenWords = (element: Element) => {
          const words = new Set(element.textContent!.split(/\s+/))
          const text = element.firstChild!
          const range = document.createRange()
          const lines: string[] = []
          let line = ''
          let top: number | null = null
          for (let i = 0; i < text.textContent!.length; i++) {
            range.setStart(text, i)
            range.setEnd(text, i + 1)
            const rect = range.getClientRects()[0]
            if (!rect) continue
            if (top !== null && Math.abs(rect.top - top) > 2) {
              lines.push(line)
              line = ''
            }
            top = rect.top
            line += text.textContent![i]
          }
          lines.push(line)
          return lines.flatMap((l) => l.trim().split(/\s+/)).filter((word) => word && !words.has(word))
        }
        return {
          section,
          statement: box(statement),
          support: box(support),
          eyebrowTop: box(eyebrow).top,
          eyebrowText: eyebrow.textContent,
          blockPadding: getComputedStyle(block).paddingBottom,
          broken: [...brokenWords(statement), ...brokenWords(support)],
        }
      })
      const detail = JSON.stringify(m)

      expect(m.eyebrowText, detail).toMatch(/Capabilities$/)
      expect(m.broken, detail).toEqual([])
      if (width >= 1024) {
        expect(Math.abs(m.statement.top - m.support.top), detail).toBeLessThanOrEqual(1)
        expect(m.support.left, detail).toBeGreaterThan(m.statement.right)
        expect(m.statement.width, detail).toBeGreaterThan(m.support.width)
      } else {
        expect(m.support.top, detail).toBeGreaterThanOrEqual(m.statement.bottom)
      }
      expect(parseFloat(m.blockPadding), detail).toBeCloseTo(m.section, 0)
      const gap = m.eyebrowTop - Math.max(m.statement.bottom, m.support.bottom)
      expect(gap, detail).toBeGreaterThanOrEqual(m.section - 1)
      if (width === 1440) {
        expect(m.eyebrowTop - m.support.bottom, detail).toBeLessThanOrEqual(1.25 * m.section)
      }
    })

    if (width === 1440) {
      // The card hover (#56): with motion allowed, hovering a card's list
      // item lifts the card 8px and darkens its border; under reduced
      // motion the card does not move. Focus never moves it.
      test(`service card hover lifts the card, except under reduced motion, at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        const card = serviceList(page).locator(':scope > li').nth(1)
        const look = () =>
          card.evaluate((item) => {
            const style = getComputedStyle(item.firstElementChild!)
            return { transform: style.transform, border: style.borderTopColor, shadow: style.boxShadow }
          })
        await card.scrollIntoViewIfNeeded()
        const resting = await look()
        expect(resting.transform).toBe('none')

        // Reduced motion (the project's setting): border and shadow
        // change, no movement.
        await card.hover()
        await expect.poll(look).not.toEqual(resting)
        expect((await look()).transform).toBe('none')
        await page.mouse.move(0, 0)
        await expect.poll(look).toEqual(resting)

        await page.emulateMedia({ reducedMotion: 'no-preference' })
        await card.hover()
        await expect.poll(async () => (await look()).transform).toBe('matrix(1, 0, 0, 1, 0, -8)')
        // The list item itself does not move.
        const itemBox = await card.boundingBox()
        await page.mouse.move(0, 0)
        await expect.poll(async () => (await look()).transform).toBe('none')
        expect(await card.boundingBox()).toEqual(itemBox)

        // Keyboard focus on the toggle moves nothing.
        await card.getByRole('button').focus()
        await page.waitForTimeout(300)
        expect((await look()).transform).toBe('none')
      })
    }

    // The system and data-flow diagram (#57): after the card grid and
    // before the managed-services block, one row of three columns per
    // layer from 768px with the names lined up, stacked below it, with no
    // overflow, no word broken across lines and every arrow joining two
    // layers.
    test(`system diagram is ${width < 768 ? 'stacked' : 'rows with the names lined up'}, after the cards, at ${width}px`, async ({ page, browserName }, testInfo) => {
      await open(page, testInfo, width)
      const flow = flowList(page)
      await expect(flow.locator(':scope > li')).toHaveCount(6)

      expectFlow(await measureFlow(page), `${width}px`, { row: width >= 768 })

      const gridBox = await serviceList(page).boundingBox()
      const flowBox = await flow.boundingBox()
      const managedBox = await page.locator('#managed-services').boundingBox()
      if (!gridBox || !flowBox || !managedBox) throw new Error('The grid, diagram or block has no box')
      expect(flowBox.y, 'below the cards').toBeGreaterThan(gridBox.y + gridBox.height)
      expect(managedBox.y, 'above the managed-services block').toBeGreaterThan(flowBox.y + flowBox.height)
      // The full container width, like the card grid.
      expect(Math.abs(flowBox.x - gridBox.x), 'left edge').toBeLessThanOrEqual(1)
      expect(Math.abs(flowBox.width - gridBox.width), 'width').toBeLessThanOrEqual(1)
      await expectNoHorizontalScroll(page)

      await flow.locator('..').screenshot({
        path: `${testInfo.project.outputDir}/screenshots/${browserName}-system-flow-${width}.png`,
      })
    })

    // Every width from 320 to 1440px, one pixel at a time, at the default
    // text size and with 200% and 150% page text (enlarged page text does
    // not move the 48em media query): one shape for every layer, rows from
    // 768px at the default size, names lined up, nothing overflowing, no
    // word broken across lines, and every arrow joined. Run from the 768px
    // projects, in Chromium and WebKit. With enlarged page text only the
    // diagram is checked for overflow, not the page: the header's inline
    // nav overflows at 1024px with 200% page text, outside #57.
    if (width === 768) {
      for (const text of ['100%', '200%', '150%'] as const) {
        test(`the system diagram holds its shape from 320 to 1440px with ${text} page text, at ${width}px`, async ({ page }, testInfo) => {
          test.setTimeout(600_000)
          await open(page, testInfo, width)
          await page.addStyleTag({ content: `html { font-size: ${text}; }` })
          const failures: string[] = []
          for (let w = 320; w <= 1440; w++) {
            await page.setViewportSize({ width: w, height: 800 })
            // Chromium can report the previous media query's styles until
            // the next rendered frame after a resize (as for the rail), so
            // wait two frames before measuring.
            await page.evaluate(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            )
            const problems = flowProblems(
              await measureFlow(page),
              text === '100%' ? { row: w >= 768 } : { page: false },
            )
            for (const problem of problems) failures.push(`${w}px: ${problem}`)
          }
          // The first 20, so a failure across many widths stays readable.
          expect(failures.slice(0, 20), `${failures.length} problems`).toEqual([])
        })
      }
    }

    // The Managed Services section (#58): its own section after Services,
    // holding one dark panel that spans the container's content width,
    // inset from the viewport with paper around it, its parts in DOM
    // order, and its text inside it.
    test(`managed-services panel spans the container, stays inset, keeps its order and fits its text at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const section = managedRegion(page)
      const panel = section.locator('.surface-dark')
      const [rail, capabilities, journey] = [0, 1, 2].map((n) => section.getByRole('list').nth(n))
      await expect(panel).toHaveCount(1)
      await expect(rail.getByRole('listitem')).toHaveCount(4)
      await expect(capabilities.getByRole('listitem')).toHaveCount(13)
      await expect(journey.getByRole('listitem')).toHaveCount(3)

      const m = await section.evaluate((root) => {
        const box = (element: Element) => element.getBoundingClientRect()
        const container = root.firstElementChild!
        const containerStyle = getComputedStyle(container)
        const panel = container.firstElementChild!
        const panelStyle = getComputedStyle(panel)
        const services = document.getElementById('services')!
        const solutions = document.getElementById('solutions')!
        const pick = (selector: string) => box(panel.querySelector(selector)!)
        return {
          viewport: document.documentElement.clientWidth,
          section: box(root),
          content: {
            left: box(container).left + parseFloat(containerStyle.paddingLeft),
            right: box(container).right - parseFloat(containerStyle.paddingRight),
          },
          panel: box(panel),
          padding: {
            inline: parseFloat(panelStyle.paddingLeft),
            block: parseFloat(panelStyle.paddingTop),
          },
          servicesBottom: box(services).bottom,
          solutionsTop: box(solutions).top,
          eyebrow: pick('.section-eyebrow'),
          h2: pick('h2'),
          approved: pick('.managed-services__eyebrow'),
          h3: pick('h3'),
          description: pick('.managed-services__description'),
          rail: pick('.managed-services__rail'),
          railItems: [...panel.querySelectorAll('.managed-services__rail-item')].map((item) => {
            const { top, left, right } = box(item)
            return { top, left, right }
          }),
          capabilities: pick('.managed-services__capabilities'),
          journey: pick('.managed-services__journey'),
        }
      })

      // Its own section, between Services and Solutions.
      expect(m.section.top, 'below Services').toBeGreaterThanOrEqual(m.servicesBottom - 1)
      expect(m.solutionsTop, 'above Solutions').toBeGreaterThanOrEqual(m.section.bottom - 1)

      // The container's full content width, and inset: paper on both
      // sides, and above and below.
      expect(Math.abs(m.panel.left - m.content.left), 'left edge').toBeLessThanOrEqual(1)
      expect(Math.abs(m.panel.right - m.content.right), 'right edge').toBeLessThanOrEqual(1)
      expect(m.panel.left, 'paper on the left').toBeGreaterThanOrEqual(16)
      expect(m.viewport - m.panel.right, 'paper on the right').toBeGreaterThanOrEqual(16)
      // Paper above comes from Services' bottom padding (the gap test below).
      expect(m.panel.top - m.servicesBottom, 'paper above').toBeGreaterThanOrEqual(0)
      expect(m.section.bottom - m.panel.bottom, 'paper below').toBeGreaterThanOrEqual(64)
      if (width >= 1024) {
        const gridBox = await serviceList(page).boundingBox()
        if (!gridBox) throw new Error('The card grid has no box')
        expect(m.panel.width, 'at least the card row').toBeGreaterThanOrEqual(gridBox.width - 1)
      }

      // Padding: --space-6 below 48em, at least --space-10 from 48em; the
      // text box is at least 240px wide at 320px.
      if (width < 768) {
        expect(m.padding).toEqual({ inline: 24, block: 24 })
      } else {
        expect(m.padding.inline).toBeGreaterThanOrEqual(40)
        expect(m.padding.block).toBeGreaterThanOrEqual(40)
      }
      expect(m.panel.width - 2 * m.padding.inline, 'text box').toBeGreaterThanOrEqual(240)

      // DOM order is visual order. From 1024px the eyebrow and h2 are one
      // column and the approved eyebrow, h3 and description a second
      // beside it, top-aligned; below it everything stacks.
      const below = (upper: DOMRect, lower: DOMRect) => lower.top >= upper.bottom - 1
      expect(below(m.eyebrow, m.h2), 'h2 below the eyebrow').toBe(true)
      expect(below(m.approved, m.h3), 'h3 below the approved eyebrow').toBe(true)
      expect(below(m.h3, m.description), 'description below the h3').toBe(true)
      if (width >= 1024) {
        expect(Math.abs(m.approved.top - m.eyebrow.top), 'columns top-aligned').toBeLessThanOrEqual(1)
        expect(m.approved.left, 'second column right of the first').toBeGreaterThanOrEqual(
          Math.max(m.eyebrow.right, m.h2.right),
        )
      } else {
        expect(below(m.h2, m.approved), 'approved eyebrow below the h2').toBe(true)
        expect(Math.abs(m.approved.left - m.eyebrow.left), 'one column').toBeLessThanOrEqual(1)
      }
      const intro = Math.max(m.h2.bottom, m.description.bottom)
      expect(m.rail.top, 'rail below both columns').toBeGreaterThanOrEqual(intro - 1)
      expect(below(m.rail, m.capabilities), 'capabilities below the rail').toBe(true)
      expect(below(m.capabilities, m.journey), 'journey below the capabilities').toBe(true)
      for (const part of [m.rail, m.capabilities, m.journey]) {
        expect(Math.abs(part.left - (m.panel.left + m.padding.inline)), 'spans the panel').toBeLessThanOrEqual(1)
      }

      // The rail: one row from 768px; it may wrap below it.
      for (let i = 1; i < m.railItems.length; i++) {
        const [before, after] = [m.railItems[i - 1], m.railItems[i]]
        if (width >= 768) {
          expect(Math.abs(after.top - before.top), `rail item ${i + 1} on the row`).toBeLessThanOrEqual(1)
        }
        expect(
          after.top > before.top + 1 || after.left >= before.right,
          `rail item ${i + 1} follows rail item ${i}`,
        ).toBe(true)
      }

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
      const stepBoxes = await journey.getByRole('listitem').evaluateAll((items) =>
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

      expect(await managedOverflow(page), 'overflowing or broken words').toEqual([])
      await expectNoHorizontalScroll(page)
    })

    // One section padding above the panel (owner decision on #58): the
    // Managed section adds no top padding after Services, so the gap from
    // the end of Services' content (it ends with the system diagram) to the panel is
    // Services' bottom padding alone, as Positioning to Services is.
    test(`one section padding above the managed-services panel at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const m = await page.evaluate(() => {
        const services = document.getElementById('services')!
        const section = document.getElementById('managed-services')!
        const panel = section.querySelector('.surface-dark')!
        const servicesContent = services.querySelector(':scope > .container')!
        const positioningContent = document.querySelector('.positioning > .container')!
        return {
          gap: panel.getBoundingClientRect().top - servicesContent.getBoundingClientRect().bottom,
          servicesPadding: parseFloat(getComputedStyle(services).paddingBottom),
          sectionPadding: parseFloat(getComputedStyle(section).paddingTop),
          rhythm:
            servicesContent.getBoundingClientRect().top -
            positioningContent.getBoundingClientRect().bottom,
        }
      })
      const detail = JSON.stringify(m)
      expect(m.sectionPadding, detail).toBe(0)
      expect(m.servicesPadding, detail).toBeGreaterThanOrEqual(64)
      expect(Math.abs(m.gap - m.servicesPadding), detail).toBeLessThanOrEqual(1)
      expect(Math.abs(m.gap - m.rhythm), `same as Positioning to Services: ${detail}`).toBeLessThanOrEqual(1)
    })

    // A fresh load of /#managed-services lands the section's top on the
    // header's bottom edge (expectLanded), in Chromium and WebKit. This
    // checks the cold-load landing itself: it only waits for the landing
    // to settle and never scrolls to the section again (#62).
    test(`/#managed-services lands below the header on a fresh load at ${width}px`, async ({ page }, testInfo) => {
      expect(testInfo.project.use.viewport?.width, 'project width').toBe(width)
      await page.goto('/#managed-services')
      await waitForLanding(page, '#managed-services')
      expect(await currentHash(page)).toBe('#managed-services')
      await expectLanded(page, '#managed-services')
    })

    // 200% page text at 320px: the rail wraps or stacks, and nothing in
    // the section overflows.
    if (width === 320) {
      test(`managed-services panel fits its text with 200% page text at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await page.addStyleTag({ content: 'html { font-size: 200%; }' })
        await waitForFonts(page)

        expect(await managedOverflow(page, { words: false }), 'overflowing').toEqual([])
        await expectNoHorizontalScroll(page)
      })
    }

    // The Solutions rows (#59): a list, not cards. Each row's button spans
    // the row and is at least 44px tall, and the summary sits outside it.
    // From 1024px the number, title, summary and chevron are on one line,
    // with the titles and the summaries lined up across the rows; below
    // it the summary is beneath the title. Opened, each panel sits
    // beneath the row's summary, inside the row, aligned with the title
    // from 1024px, its themes in data order in one column below 768px and
    // at most two, top to bottom, from 768px. Nothing overflows.
    test(`solutions rows are ${width >= 1024 ? 'one line each, lined up' : 'title then summary'}, not cards, and open beneath the row, at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      await expect(sectorButtons(page)).toHaveCount(5)

      const closed = await measureSectors(page)
      const detail = (row: SectorBox) => JSON.stringify(row)
      expect(closed.listBorder, 'hairline below the last row').toEqual(closed.hairline)
      for (const row of closed.rows) {
        // Not card-like: no fill, shadow, radius or side borders; one
        // graphite 200 hairline above.
        expect(row.style, detail(row)).toEqual({
          background: 'rgba(0, 0, 0, 0)',
          shadow: 'none',
          radius: '0px',
          sides: '0px 0px',
          top: closed.hairline,
        })
        expect(Math.abs(row.button.left - row.row.left), `button spans the row: ${detail(row)}`).toBeLessThanOrEqual(1)
        expect(Math.abs(row.button.right - row.row.right), `button spans the row: ${detail(row)}`).toBeLessThanOrEqual(1)
        expect(row.button.height, `button height: ${detail(row)}`).toBeGreaterThanOrEqual(44)
        expect(Math.abs(row.chevron.right - row.button.right), `chevron at the end: ${detail(row)}`).toBeLessThanOrEqual(1)
        // Number and title on one line.
        expect(row.number.top < row.title.bottom && row.number.bottom > row.title.top, `number beside the title: ${detail(row)}`).toBe(true)
        expect(row.title.left, `title after the number: ${detail(row)}`).toBeGreaterThanOrEqual(row.number.right)
        expect(row.panelHidden, detail(row)).toBe(true)
        if (width >= 1024) {
          expect(row.summary.top < row.title.bottom && row.summary.bottom > row.title.top, `summary beside the title: ${detail(row)}`).toBe(true)
          expect(row.summary.left, `summary after the title column: ${detail(row)}`).toBeGreaterThan(row.title.left)
          expect(row.summary.right, `summary before the chevron: ${detail(row)}`).toBeLessThanOrEqual(row.chevron.left)
          expect(row.summaryLines, `summary on one line: ${detail(row)}`).toBe(1)
        } else {
          expect(row.summary.top, `summary beneath the title: ${detail(row)}`).toBeGreaterThanOrEqual(row.button.bottom - 1)
          expect(row.summary.bottom, `summary inside the row: ${detail(row)}`).toBeLessThanOrEqual(row.row.bottom + 1)
        }
      }
      if (width >= 1024) {
        expect(spread(closed.rows.map((row) => row.title.left)), 'titles lined up').toBeLessThanOrEqual(1)
        expect(spread(closed.rows.map((row) => row.summary.left)), 'summaries lined up').toBeLessThanOrEqual(1)
        expect(spread(closed.rows.map((row) => row.number.left)), 'numbers lined up').toBeLessThanOrEqual(1)
      }
      // Compact: no taller than 5 x (title line height + --space-12).
      if (width === 1440) {
        const limit = 5 * (closed.rows[0].titleLineHeight + 48)
        expect(closed.listHeight, `list height, limit ${limit}`).toBeLessThanOrEqual(limit)
      }
      expect(await sectorOverflow(page), 'overflowing, collapsed').toEqual([])

      await openAllSectors(page)
      const opened = await measureSectors(page)
      opened.rows.forEach((row, index) => {
        expect(row.panelHidden, detail(row)).toBe(false)
        expect(row.panel.top, `panel beneath the summary: ${detail(row)}`).toBeGreaterThanOrEqual(
          Math.max(row.summary.bottom, row.button.bottom) - 1,
        )
        expect(row.panel.bottom, `panel inside the row: ${detail(row)}`).toBeLessThanOrEqual(row.row.bottom + 1)
        if (width >= 768) {
          expect(Math.abs(row.panel.left - row.title.left), `panel aligned with the title: ${detail(row)}`).toBeLessThanOrEqual(1)
        }
        // The themes in data order, one column below 768px, at most two
        // from 768px, flowing down each column.
        expect(row.themes.map((theme) => theme.text)).toEqual(solutions[index].themes)
        const lefts = new Set(row.themes.map((theme) => Math.round(theme.left)))
        expect(lefts.size, `theme columns: ${detail(row)}`).toBeLessThanOrEqual(width >= 768 ? 2 : 1)
        for (let i = 1; i < row.themes.length; i++) {
          const [before, after] = [row.themes[i - 1], row.themes[i]]
          expect(
            after.left > before.left + 1 || (Math.abs(after.left - before.left) <= 1 && after.top >= before.bottom - 1),
            `theme ${i + 1} follows theme ${i}: ${detail(row)}`,
          ).toBe(true)
        }
      })
      // Opening a row moves no other row's title sideways.
      opened.rows.forEach((row, index) => {
        expect(Math.abs(row.title.left - closed.rows[index].title.left)).toBeLessThanOrEqual(1)
      })
      expect(await sectorOverflow(page), 'overflowing, all open').toEqual([])
      await expectNoHorizontalScroll(page)
    })

    // A tap opens and closes a row, on its number, its title or the space
    // before the chevron, and leaves the other rows closed.
    test.describe('touch', () => {
      test.use({ hasTouch: true })

      test(`a tap opens and closes a Solutions row at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        const button = sectorButtons(page).nth(1)
        const panel = page.locator(`[id="${await button.getAttribute('aria-controls')}"]`)
        await button.scrollIntoViewIfNeeded()

        await button.locator('.solution-row__title').tap()
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        await expect(panel).toBeVisible()
        await button.locator('.solution-row__number').tap()
        await expect(button).toHaveAttribute('aria-expanded', 'false')
        await expect(panel).toBeHidden()
        const box = await button.boundingBox()
        if (!box) throw new Error('No button box')
        // Just before the chevron, which is --space-4 wide at the end.
        await page.touchscreen.tap(box.x + box.width - 16 - 4, box.y + box.height / 2)
        await expect(button).toHaveAttribute('aria-expanded', 'true')

        // A mouse click on the summary toggles nothing. A tap there is not
        // checked: in WebKit, touch adjustment sends a tap that close to
        // the button to the button, as Safari on iOS does (measured for
        // #59: a tap on "Inventory" at 360px opened Retail & Distribution
        // in WebKit, and did nothing in Chromium).
        await sectorButtons(page).nth(1).locator('xpath=../../ul[1]/li[1]').click()
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        await button.locator('.solution-row__title').tap()
        await expect(button).toHaveAttribute('aria-expanded', 'false')
        for (const other of [0, 2, 3, 4]) {
          await expect(sectorButtons(page).nth(other)).toHaveAttribute('aria-expanded', 'false')
        }
      })
    })

    if (width === 320) {
      test(`solutions rows fit with 200% page text, collapsed and open, at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await page.addStyleTag({ content: 'html { font-size: 200%; }' })
        await waitForFonts(page)

        expect(await sectorOverflow(page), 'overflowing, collapsed').toEqual([])
        await expectNoHorizontalScroll(page)
        await openAllSectors(page)
        expect(await sectorOverflow(page), 'overflowing, all open').toEqual([])
        await expectNoHorizontalScroll(page)
      })
    }

    // How We Work (#59): a horizontal timeline from 1024px, the four
    // stages in one row of equal columns, and a vertical one below it.
    // The line is one segment per stage but the last, which together run
    // from the first node's centre to the last one's: horizontal at one
    // height, or vertical at one inline position. Each stage's text sits
    // below its node (horizontal) or to its inline end (vertical).
    test(`the How We Work timeline is ${width >= 1024 ? 'horizontal' : 'vertical'}, with one continuous line through the nodes, at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const region = page.getByRole('region', { name: 'How We Work' })
      await expect(region.getByRole('heading', { level: 3 })).toHaveText(['Assess', 'Design', 'Build', 'Govern'])

      const m = await region.getByRole('list').evaluate((list) => {
        const px = (value: string) => parseFloat(value)
        return [...list.children].map((item) => {
          const box = item.getBoundingClientRect()
          const node = getComputedStyle(item, '::before')
          const line = getComputedStyle(item, '::after')
          const nodeLeft = box.left + px(node.left)
          const nodeTop = box.top + px(node.top)
          const text = (selector: string) => item.querySelector(selector)!.getBoundingClientRect()
          return {
            box: { left: box.left, top: box.top, width: box.width, bottom: box.bottom },
            node: {
              left: nodeLeft,
              right: nodeLeft + px(node.width),
              top: nodeTop,
              bottom: nodeTop + px(node.height),
              x: nodeLeft + px(node.width) / 2,
              y: nodeTop + px(node.height) / 2,
            },
            line:
              line.content === 'none'
                ? null
                : {
                    left: box.left + px(line.left),
                    top: box.top + px(line.top),
                    width: px(line.width) + px(line.borderLeftWidth),
                    height: px(line.height) + px(line.borderTopWidth),
                  },
            number: text('span'),
            name: text('h3'),
            description: text('p'),
          }
        })
      })
      const detail = JSON.stringify(m)
      expect(m).toHaveLength(4)
      expect(m[3].line, 'no line after the last stage').toBeNull()

      if (width >= 1024) {
        expect(spread(m.map((stage) => stage.box.top)), 'one row').toBeLessThanOrEqual(1)
        expect(spread(m.map((stage) => stage.box.width)), 'equal columns').toBeLessThanOrEqual(1)
        expect(spread(m.map((stage) => stage.node.y)), 'nodes at one height').toBeLessThanOrEqual(0.5)
        for (let i = 0; i < 3; i++) {
          const line = m[i].line!
          expect(m[i + 1].box.left, `stage ${i + 2} right of stage ${i + 1}`).toBeGreaterThan(m[i].box.left)
          expect(Math.abs(line.left - m[i].node.x), `segment ${i + 1} starts at its node: ${detail}`).toBeLessThanOrEqual(1)
          expect(Math.abs(line.left + line.width - m[i + 1].node.x), `segment ${i + 1} reaches the next node: ${detail}`).toBeLessThanOrEqual(1)
          expect(Math.abs(line.top + line.height / 2 - m[0].node.y), `segment ${i + 1} at the nodes' height: ${detail}`).toBeLessThanOrEqual(1)
        }
        for (const stage of m) {
          expect(stage.number.top, `text below the node: ${detail}`).toBeGreaterThanOrEqual(stage.node.bottom)
        }
      } else {
        expect(spread(m.map((stage) => stage.box.left)), 'one column').toBeLessThanOrEqual(1)
        expect(spread(m.map((stage) => stage.node.x)), 'nodes at one inline position').toBeLessThanOrEqual(0.5)
        for (let i = 0; i < 3; i++) {
          const line = m[i].line!
          expect(m[i + 1].box.top, `stage ${i + 2} below stage ${i + 1}`).toBeGreaterThanOrEqual(m[i].box.bottom)
          expect(Math.abs(line.top - m[i].node.y), `segment ${i + 1} starts at its node: ${detail}`).toBeLessThanOrEqual(1)
          expect(Math.abs(line.top + line.height - m[i + 1].node.y), `segment ${i + 1} reaches the next node: ${detail}`).toBeLessThanOrEqual(1)
          expect(Math.abs(line.left + line.width / 2 - m[0].node.x), `segment ${i + 1} through the nodes: ${detail}`).toBeLessThanOrEqual(1)
        }
        for (const stage of m) {
          for (const part of [stage.number, stage.name, stage.description]) {
            expect(part.left, `text to the node's inline end: ${detail}`).toBeGreaterThanOrEqual(stage.node.right)
          }
          expect(Math.abs(stage.node.y - (stage.number.top + stage.number.bottom) / 2), `node on the number's line: ${detail}`).toBeLessThanOrEqual(1)
        }
      }
      // Number, then name, then description, each below the last.
      for (const stage of m) {
        expect(stage.name.top).toBeGreaterThanOrEqual(stage.number.bottom - 1)
        expect(stage.description.top).toBeGreaterThanOrEqual(stage.name.bottom - 1)
      }
      // A stage's scroll width includes its line segment, which reaches
      // into the next stage by design, so stages are checked by their box
      // only.
      const overflowing = await region.evaluate((root) =>
        [...root.querySelectorAll('h2, h3, p, span')]
          .filter(
            (element) =>
              element.scrollWidth > element.clientWidth + 1 ||
              element.getBoundingClientRect().right > root.getBoundingClientRect().right + 1,
          )
          .map((element) => element.textContent?.slice(0, 40)),
      )
      expect(overflowing).toEqual([])
      const section = await region.boundingBox()
      if (!section) throw new Error('No How We Work box')
      for (const stage of m) {
        expect(stage.box.left + stage.box.width, `stage inside the section: ${detail}`)
          .toBeLessThanOrEqual(section.x + section.width + 1)
      }
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
      ['Discuss your data needs', '#contact'],
      ['Explore our capabilities', '#services'],
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
