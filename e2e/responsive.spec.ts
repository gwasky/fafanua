import type { Page, TestInfo } from '@playwright/test'
import { expect } from '@playwright/test'
import { managedServices, servicesIntro } from '../src/data/services.ts'
import { footerSolutions, homepageSolutions } from '../src/data/solutions.ts'
import {
  WIDTHS,
  expectLanded,
  linkName,
  test,
  waitForFonts,
  waitForLanding,
  waitForScrollSettle,
} from './fixtures.ts'
import { expectFlow, flowDiagram, flowList, flowProblems, flowShapeAt, measureFlow } from './systemFlow.ts'

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
const NAV = ['Services', 'Solutions', 'How We Work', 'About', 'Book a data trust assessment'] as const
const FOOTER_NAV = ['Services', 'Solutions', 'How We Work', 'About', 'Contact'] as const
const HASH: Record<(typeof NAV)[number] | (typeof FOOTER_NAV)[number], string> = {
  Services: '#services',
  Solutions: '#solutions',
  'How We Work': '#how-we-work',
  About: '#about',
  'Book a data trust assessment': '#contact',
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
  '#contact', // hero "Book a data trust assessment", its one call to action (#68)
  '#contact', // the Data Trust Assessment's button (#71)
  '#services', // footer nav
  '#solutions',
  '#how-we-work',
  '#about',
  '#contact',
]

// The Services section is named by its h2, W3's heading in the trust and
// lineage plan (#56, #70).
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

/**
 * Checks the problem block's W10 layout (#80) at the current viewport
 * width `w`: see the test that calls it.
 */
async function checkProblemBlock(page: Page, w: number, text: '100%' | '200%') {
  const m = await page.evaluate(() => {
    const block = document.querySelector('main > div:not([id])')!
    const paragraphs = [...block.querySelectorAll('p')]
    const [eyebrow, statement, framing, bridge] = paragraphs
    const inner = block.firstElementChild!
    const row = framing.parentElement!
    const spans = [...statement.children]
    const next = document.querySelector('#data-trust-assessment .section-eyebrow')!
    // The assessment's panel (#82): the gap is to its top edge.
    const nextPanel = document.querySelector('#data-trust-assessment .surface-dark')!
    const box = (element: Element) => element.getBoundingClientRect().toJSON() as DOMRect
    // A fresh probe for each token: the page's content security
    // policy keeps a reused probe's style attribute from resetting.
    const token = (property: string, value: string) => {
      const element = document.createElement('div')
      document.body.append(element)
      element.style.setProperty(property, value)
      const result = getComputedStyle(element).getPropertyValue(property)
      element.remove()
      return result
    }
    const tokens = {
      section: parseFloat(token('padding-top', 'var(--space-section)')),
      space6: parseFloat(token('padding-top', 'var(--space-6)')),
      space8: parseFloat(token('padding-top', 'var(--space-8)')),
      space12: parseFloat(token('padding-top', 'var(--space-12)')),
      statementSize: token('font-size', 'var(--text-statement)'),
      lg: token('font-size', 'var(--text-lg)'),
      xl: token('font-size', 'var(--text-xl)'),
      eyebrowSize: token('font-size', 'var(--text-eyebrow)'),
      heading: token('color', 'var(--color-heading)'),
      muted: token('color', 'var(--color-text-muted)'),
      accent: token('color', 'var(--color-accent)'),
      border: token('color', 'var(--color-border)'),
      width: parseFloat(token('width', 'var(--container-statement)')),
    }
    const lineProbe = document.createElement('div')
    lineProbe.style.fontSize = 'var(--text-statement)'
    lineProbe.style.lineHeight = 'var(--leading-tight)'
    document.body.append(lineProbe)
    const tight = getComputedStyle(lineProbe).lineHeight
    lineProbe.remove()
    const innerStyle = getComputedStyle(inner)
    const contentLeft = box(inner).left + parseFloat(innerStyle.paddingLeft)
    const contentRight = box(inner).right - parseFloat(innerStyle.paddingRight)
    // The eyebrow's text, without its hairlines.
    const textRange = document.createRange()
    textRange.selectNodeContents(eyebrow)
    const eyebrowText = textRange.getBoundingClientRect().toJSON() as DOMRect
    const pseudo = (which: '::before' | '::after') => {
      const s = getComputedStyle(eyebrow, which)
      return {
        content: s.content,
        width: parseFloat(s.width),
        top: s.borderTopWidth,
        topColor: s.borderTopColor,
        topStyle: s.borderTopStyle,
      }
    }
    // A word broken across lines leaves a line that starts or ends
    // mid-word: compare each line's text with the paragraph's words.
    // Walks every text node, so the statement's two spans are both read.
    const brokenWords = (element: Element) => {
      const words = new Set(element.textContent!.split(/\s+/))
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      const lines: string[] = []
      let line = ''
      let top: number | null = null
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (let i = 0; i < node.textContent!.length; i++) {
          range.setStart(node, i)
          range.setEnd(node, i + 1)
          const rect = range.getClientRects()[0]
          if (!rect) {
            line += node.textContent![i]
            continue
          }
          if (top !== null && Math.abs(rect.top - top) > 2) {
            lines.push(line)
            line = ''
          }
          top = rect.top
          line += node.textContent![i]
        }
      }
      lines.push(line)
      return lines.flatMap((l) => l.trim().split(/\s+/)).filter((word) => word && !words.has(word))
    }
    const style = (element: Element) => {
      const s = getComputedStyle(element)
      return {
        size: s.fontSize,
        weight: s.fontWeight,
        color: s.color,
        lineHeight: s.lineHeight,
        tracking: s.letterSpacing,
        transform: s.textTransform,
        align: s.textAlign,
        wrap: s.getPropertyValue('text-wrap-style') || s.getPropertyValue('text-wrap'),
      }
    }
    const bridgeStyle = getComputedStyle(bridge)
    // Everything inside the container, whose padding is outside its
    // content box.
    const all = [...inner.querySelectorAll('*')]
    return {
      tokens,
      tight,
      textContent: block.textContent,
      texts: paragraphs.map((p) => p.textContent),
      eyebrowClass: eyebrow.className,
      eyebrowInnerText: (eyebrow as HTMLElement).innerText,
      eyebrowText,
      before: pseudo('::before'),
      after: pseudo('::after'),
      contentLeft,
      contentRight,
      blockPaddingTop: parseFloat(getComputedStyle(block).paddingTop),
      blocks: paragraphs.map(box),
      styles: paragraphs.map(style),
      spans: spans.map((span) => ({ tag: span.tagName, ...style(span) })),
      row: box(row),
      rowColumns: getComputedStyle(row).gridTemplateColumns.split(' ').length,
      divider: {
        start: { width: bridgeStyle.borderLeftWidth, style: bridgeStyle.borderLeftStyle, color: bridgeStyle.borderLeftColor },
        top: { width: bridgeStyle.borderTopWidth, style: bridgeStyle.borderTopStyle, color: bridgeStyle.borderTopColor },
        paddingStart: parseFloat(bridgeStyle.paddingLeft),
        paddingTop: parseFloat(bridgeStyle.paddingTop),
      },
      framingRowGap: parseFloat(getComputedStyle(row).rowGap),
      eyebrowTracking: parseFloat(getComputedStyle(eyebrow).letterSpacing) / parseFloat(getComputedStyle(eyebrow).fontSize),
      media: block.querySelectorAll('img, picture, svg, canvas, video').length,
      backgroundImages: [block, ...block.querySelectorAll('*')].map((e) => getComputedStyle(e).backgroundImage).filter((b) => b !== 'none'),
      nextTop: box(nextPanel).top,
      nextText: next.textContent,
      blockPadding: parseFloat(getComputedStyle(block).paddingBottom),
      nextPadding: parseFloat(getComputedStyle(block.nextElementSibling!).paddingTop),
      broken: paragraphs.flatMap(brokenWords),
      outside: all
        .filter((element) => box(element).left < contentLeft - 1 || box(element).right > contentRight + 1)
        .map((element) => `${element.tagName}.${element.className}`),
      clipped: all
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => `${element.tagName}.${element.className}`),
    }
  })
  const detail = `${w}px, ${text}: ${JSON.stringify(m)}`
  const [eyebrow, statement, framing, bridge] = m.blocks
  const [eyebrowStyle, statementStyle, framingStyle, bridgeStyle] = m.styles
  const mid = (b: { left: number; right: number }) => (b.left + b.right) / 2
  const contentMid = (m.contentLeft + m.contentRight) / 2

  // Four paragraphs, in reading order, and nothing else: no new text and
  // no image.
  const texts = [
    'The problem',
    'Most organisations already have data, reporting and operational systems. The challenge is making the information flowing through them connected, consistent and trusted.',
    'Organisations rarely lack data. The challenge is knowing whether the numbers used to run the business are connected, consistent and trustworthy.',
    'That is why Fafanua starts by tracing the numbers leadership relies on most back to their source.',
  ]
  expect(m.texts, detail).toEqual(texts)
  expect(m.textContent, detail).toBe(texts.join(''))
  expect(m.media, detail).toBe(0)
  expect(m.backgroundImages, detail).toEqual([])
  expect(Math.abs(m.blockPaddingTop - m.tokens.section), detail).toBeLessThanOrEqual(1)

  // The eyebrow, in the existing eyebrow style, centred between two teal
  // hairlines of equal length.
  expect(m.eyebrowClass, detail).toBe('section-eyebrow')
  expect(m.eyebrowInnerText, detail).toBe('THE PROBLEM')
  expect(eyebrowStyle.size, detail).toBe(m.tokens.eyebrowSize)
  expect(eyebrowStyle.weight, detail).toBe('500')
  expect(eyebrowStyle.transform, detail).toBe('uppercase')
  expect(eyebrowStyle.color, detail).toBe(m.tokens.muted)
  expect(m.eyebrowTracking, detail).toBeCloseTo(0.08, 2)
  expect(Math.abs(mid(m.eyebrowText) - contentMid), detail).toBeLessThanOrEqual(1)
  for (const line of [m.before, m.after]) {
    expect(line.content, detail).toBe('""')
    expect(line.top, detail).toBe('1px')
    expect(line.topStyle, detail).toBe('solid')
    expect(line.topColor, detail).toBe(m.tokens.accent)
  }
  expect(m.before.width, detail).toBeGreaterThan(0)
  expect(Math.abs(m.before.width - m.after.width), detail).toBeLessThanOrEqual(1)

  // The statement: centred, the largest text, weight 300 in two tones.
  expect(statementStyle.align, detail).toBe('center')
  expect(Math.abs(mid(statement) - contentMid), detail).toBeLessThanOrEqual(1)
  expect(statement.width, detail).toBeLessThanOrEqual(m.tokens.width + 1)
  expect(statementStyle.wrap, detail).toContain('balance')
  expect(statementStyle.size, detail).toBe(m.tokens.statementSize)
  if (text === '100%') {
    const expected = w >= 1440 ? 52 : w === 1024 ? 40.96 : 32
    expect(Math.abs(parseFloat(statementStyle.size) - expected), detail).toBeLessThanOrEqual(0.5)
  }
  expect(m.spans.map((span) => span.tag), detail).toEqual(['SPAN', 'SPAN'])
  for (const span of [statementStyle, ...m.spans]) {
    expect(span.size, detail).toBe(m.tokens.statementSize)
    expect(span.weight, detail).toBe('300')
    expect(span.lineHeight, detail).toBe(m.tight)
  }
  expect(m.spans[0].color, detail).toBe(m.tokens.muted)
  expect(m.spans[0].color, detail).toBe('rgb(84, 94, 104)')
  expect(m.spans[1].color, detail).toBe(m.tokens.heading)
  expect(m.spans[1].color, detail).toBe('rgb(28, 32, 36)')

  // The framing and bridge: secondary, the bridge a step larger.
  expect(framingStyle.size, detail).toBe(m.tokens.lg)
  expect(framingStyle.weight, detail).toBe('400')
  expect(framingStyle.color, detail).toBe(m.tokens.muted)
  expect(bridgeStyle.size, detail).toBe(m.tokens.xl)
  expect(bridgeStyle.weight, detail).toBe('400')
  expect(bridgeStyle.color, detail).toBe(m.tokens.heading)
  expect(parseFloat(bridgeStyle.size), detail).toBeGreaterThan(parseFloat(framingStyle.size))
  for (const s of [eyebrowStyle, framingStyle, bridgeStyle]) {
    expect(parseFloat(s.size), detail).toBeLessThan(parseFloat(statementStyle.size))
  }
  for (const s of [framingStyle, bridgeStyle]) expect(['start', 'left'], detail).toContain(s.align)

  // Spacing: eyebrow to statement --space-6; statement to row --space-12
  // from 48em and --space-8 below.
  expect(Math.abs(statement.top - eyebrow.bottom - m.tokens.space6), detail).toBeLessThanOrEqual(1)
  expect(
    Math.abs(m.row.top - statement.bottom - (w >= 768 ? m.tokens.space12 : m.tokens.space8)),
    detail,
  ).toBeLessThanOrEqual(1)

  // The row: as wide as the statement and centred under it.
  expect(Math.abs(m.row.width - statement.width), detail).toBeLessThanOrEqual(1)
  expect(Math.abs(mid(m.row) - mid(statement)), detail).toBeLessThanOrEqual(1)
  if (w >= 768) {
    // Side by side (a media query in em follows the browser's text size,
    // not page text, so with 200% page text the row stays), tops level,
    // the framing on the left, one 1px vertical hairline between them as
    // tall as the row, --space-8 from each text.
    expect(m.rowColumns, detail).toBe(2)
    expect(Math.abs(framing.top - bridge.top), detail).toBeLessThanOrEqual(1)
    expect(framing.right, detail).toBeLessThan(bridge.left)
    expect(Math.abs(framing.left - m.row.left), detail).toBeLessThanOrEqual(1)
    expect(m.divider.start, detail).toEqual({ width: '1px', style: 'solid', color: m.tokens.border })
    expect(m.divider.top.style, detail).toBe('none')
    expect(Math.abs(bridge.height - m.row.height), detail).toBeLessThanOrEqual(1)
    const lineX = bridge.left + 0.5
    const textLeft = bridge.left + 1 + m.divider.paddingStart
    expect(Math.abs(lineX - framing.right - (textLeft - lineX)), detail).toBeLessThanOrEqual(1)
    expect(Math.abs(bridge.left - framing.right - m.tokens.space8), detail).toBeLessThanOrEqual(1)
    expect(Math.abs(m.divider.paddingStart - m.tokens.space8), detail).toBeLessThanOrEqual(1)
  } else {
    // Stacked in DOM order, no two blocks overlapping, the framing and
    // bridge on the row's left edge, one 1px horizontal hairline between
    // them, --space-6 from each, and no vertical hairline.
    expect(m.rowColumns, detail).toBe(1)
    m.blocks.forEach((b, i) => {
      if (i > 0) expect(b.top, `block ${i + 1}: ${detail}`).toBeGreaterThanOrEqual(m.blocks[i - 1].bottom - 1)
    })
    expect(Math.abs(framing.left - m.row.left), detail).toBeLessThanOrEqual(1)
    expect(Math.abs(bridge.left - m.row.left), detail).toBeLessThanOrEqual(1)
    expect(m.divider.top, detail).toEqual({ width: '1px', style: 'solid', color: m.tokens.border })
    expect(m.divider.start.style, detail).toBe('none')
    expect(Math.abs(bridge.top - framing.bottom - m.tokens.space6), detail).toBeLessThanOrEqual(1)
    expect(Math.abs(m.divider.paddingTop - m.tokens.space6), detail).toBeLessThanOrEqual(1)
  }

  // One section padding from the block's lowest content to the
  // assessment's panel (#82), whose first content is its eyebrow, split between this block's bottom padding and
  // the section's top padding (#71): not doubled, not zero.
  expect(m.nextText, detail).toBe('Start with trust')
  expect(Math.abs(m.blockPadding + m.nextPadding - m.tokens.section), detail).toBeLessThanOrEqual(1)
  const bottom = Math.max(m.row.bottom, ...m.blocks.map((b) => b.bottom))
  expect(Math.abs(m.nextTop - bottom - m.tokens.section), `gap: ${detail}`).toBeLessThanOrEqual(1)
  // Nothing outside the content box or clipped, the eyebrow and its
  // hairlines included, and at 100% text no word broken mid-word.
  expect(m.outside, detail).toEqual([])
  expect(m.clipped, detail).toEqual([])
  expect(m.eyebrowText.left, detail).toBeGreaterThanOrEqual(m.contentLeft - 1)
  expect(m.eyebrowText.right, detail).toBeLessThanOrEqual(m.contentRight + 1)
  if (text === '100%') expect(m.broken, detail).toEqual([])
}

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

// The hero, named by its h1. The header's and the closing call to action
// share the hero button's name "Book a data trust assessment" (#60, #68), so
// hero links are found inside it.
const heroRegion = (page: Page) =>
  page.getByRole('region', { name: 'Trusted Data. Better Decisions.' })

// The Solutions section's three row buttons (#59, #73), in order.
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

/**
 * The Data Trust Assessment's layout (#71, laid out by the dark panel
 * plan in #82): its padding and the gaps from its neighbours' content to
 * the panel, the panel's padding and three rows, the intro's eyebrow row,
 * name, h2, lead, facts pill and contour lines, the card's chips, seven
 * steps and ratings, the tiles, the closing strip, and anything
 * overlapping, outside the panel's content box, overflowing or broken
 * mid-word.
 */
const measureAssessment = (page: Page) =>
  page.evaluate(() => {
    const section = document.getElementById('data-trust-assessment')!
    const container = section.querySelector(':scope > .container')!
    const panel = container.firstElementChild!
    const [intro, figure, receive, next] = [...panel.children]
    const box = (element: Element) => element.getBoundingClientRect()
    const rect = (element: Element) => box(element).toJSON() as DOMRect
    // A fresh probe for each token, in the given parent (the page, the
    // dark panel or the light card): the page's content security policy
    // keeps a reused probe's style attribute from resetting.
    const tokenIn = (parent: Element, property: string, value: string) => {
      const element = document.createElement('div')
      parent.append(element)
      element.style.setProperty(property, value)
      const result = getComputedStyle(element).getPropertyValue(property)
      element.remove()
      return result
    }
    const token = (property: string, value: string) => tokenIn(document.body, property, value)
    const px = (value: string) => parseFloat(token('padding-top', value))
    const dark = (value: string) => tokenIn(panel, 'color', value)
    const light = (value: string) => tokenIn(figure, 'color', value)
    const tokens = {
      space2: px('var(--space-2)'),
      space3: px('var(--space-3)'),
      space4: px('var(--space-4)'),
      space6: px('var(--space-6)'),
      space8: px('var(--space-8)'),
      space10: px('var(--space-10)'),
      space12: px('var(--space-12)'),
      space16: px('var(--space-16)'),
      space24: px('var(--space-24)'),
      measure: px('var(--measure)'),
      sm: parseFloat(token('font-size', 'var(--text-sm)')),
      base: parseFloat(token('font-size', 'var(--text-base)')),
      xl2: parseFloat(token('font-size', 'var(--text-2xl)')),
      eyebrow: parseFloat(token('font-size', 'var(--text-eyebrow)')),
      // Inside the panel (.surface-dark).
      dark: {
        bg: dark('var(--color-bg)'),
        surface: dark('var(--color-surface)'),
        heading: dark('var(--color-heading)'),
        text: dark('var(--color-text)'),
        muted: dark('var(--color-text-muted)'),
        border: dark('var(--color-border)'),
        accent: dark('var(--color-accent)'),
        accentText: dark('var(--color-accent-text)'),
        buttonBg: dark('var(--color-button-bg)'),
        buttonText: dark('var(--color-button-text)'),
      },
      // Inside the card (.surface-light).
      light: {
        surface: light('var(--color-surface)'),
        heading: light('var(--color-heading)'),
        text: light('var(--color-text)'),
        muted: light('var(--color-text-muted)'),
        border: light('var(--color-border)'),
        accent: light('var(--color-accent)'),
        warning: light('var(--state-warning)'),
        tagText: light('var(--color-tag-text)'),
        tagBg: light('var(--color-tag-bg)'),
      },
    }
    // One --space-section: the problem block's top padding, measured
    // where it is used.
    const positioning = document.querySelector('.positioning')!
    const section_ = parseFloat(getComputedStyle(positioning).paddingTop)
    const paper = getComputedStyle(positioning).backgroundColor
    // The problem block's lowest content bottom: its framing and bridge
    // line sit side by side from 48em (#80).
    const problemBottom = Math.max(
      ...[...positioning.querySelectorAll('p')].map((p) => p.getBoundingClientRect().bottom),
    )
    const servicesFirst = document.querySelector('#services > .container')!.firstElementChild!
    const panelStyle = getComputedStyle(panel)
    const inner = {
      left: box(panel).left + parseFloat(panelStyle.paddingLeft),
      right: box(panel).right - parseFloat(panelStyle.paddingRight),
      top: box(panel).top + parseFloat(panelStyle.paddingTop),
      bottom: box(panel).bottom - parseFloat(panelStyle.paddingBottom),
    }
    const all = [...panel.querySelectorAll('*')]
    const [eyebrowRow, nameLine, h2, lead, facts, contours] = [...intro.children]
    const eyebrow = eyebrowRow.firstElementChild!
    const metrics = [...figure.querySelectorAll(':scope > ul:first-of-type > li')]
    const trace = figure.querySelector(':scope > div')!
    const [stepsLabel, stepsList] = [...trace.children]
    const steps = [...stepsList.children]
    const ratingsList = figure.lastElementChild!
    const ratings = [...ratingsList.children]
    const tiles = [...receive.querySelectorAll(':scope > ul > li')]
    const [nextText, actions] = [...next.children]
    const [nextEyebrow, statement, supporting] = [...nextText.children]
    const button = actions.querySelector('a')!
    const name = (element: Element) => element.textContent?.slice(0, 30)
    const borders = (style: CSSStyleDeclaration) =>
      [style.borderTopWidth, style.borderTopStyle, style.borderTopColor].join(' ') +
      ' | ' +
      [style.borderRightWidth, style.borderRightStyle, style.borderRightColor].join(' ') +
      ' | ' +
      [style.borderBottomWidth, style.borderBottomStyle, style.borderBottomColor].join(' ') +
      ' | ' +
      [style.borderLeftWidth, style.borderLeftStyle, style.borderLeftColor].join(' ')
    const look = (element: Element) => {
      const style = getComputedStyle(element)
      return {
        size: parseFloat(style.fontSize),
        weight: style.fontWeight,
        color: style.color,
        background: style.backgroundColor,
        transform: style.textTransform,
        tracking: parseFloat(style.letterSpacing) / parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize),
      }
    }
    // The first line of an element's text.
    const firstLine = (element: Element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      return range.getClientRects()[0].toJSON() as DOMRect
    }
    // Blocks in reading order that must stack, each below the one before.
    const sequences = [
      [eyebrowRow, nameLine, h2, lead, facts],
      [...figure.children],
      [stepsLabel, ...steps],
      ...steps.map((step) => [...step.children]),
      [receive.firstElementChild!, receive.lastElementChild!],
      ...tiles.map((tile) => [...tile.children]),
      [nextEyebrow, statement, supporting],
    ]
    // Items that wrap in rows: no two may share any area.
    const groups = [metrics, ratings, tiles]
    const overlaps = [
      ...sequences.flatMap((blocks) =>
        blocks.slice(1).flatMap((block, i) =>
          box(block).top < box(blocks[i]).bottom - 1 ? [`${name(blocks[i])} / ${name(block)}`] : [],
        ),
      ),
      ...groups.flatMap((items) =>
        items.flatMap((a, i) =>
          items.slice(i + 1).flatMap((b) => {
            const [p, q] = [box(a), box(b)]
            const apart = p.right <= q.left + 1 || q.right <= p.left + 1 || p.bottom <= q.top + 1 || q.bottom <= p.top + 1
            return apart ? [] : [`${name(a)} / ${name(b)}`]
          }),
        ),
      ),
    ]
    // A word broken across lines leaves a line that starts or ends
    // mid-word: compare each line's text with the element's words.
    const brokenWords = (element: Element) => {
      const text = element.firstChild
      if (!(text instanceof Text)) return []
      const words = new Set(text.textContent!.split(/\s+/))
      const range = document.createRange()
      const lines: string[] = []
      let line = ''
      let top: number | null = null
      for (let i = 0; i < text.textContent!.length; i++) {
        range.setStart(text, i)
        range.setEnd(text, i + 1)
        const r = range.getClientRects()[0]
        if (!r) continue
        if (top !== null && Math.abs(r.top - top) > 2) {
          lines.push(line)
          line = ''
        }
        top = r.top
        line += text.textContent![i]
      }
      lines.push(line)
      return lines.flatMap((l) => l.trim().split(/\s+/)).filter((word) => word && !words.has(word))
    }
    const figureStyle = getComputedStyle(figure)
    const nextStyle = getComputedStyle(next)
    const tilesStyle = getComputedStyle(receive.lastElementChild!)
    const hairline = getComputedStyle(eyebrowRow, '::after')
    const hairlineLeft = box(eyebrow).right + parseFloat(getComputedStyle(eyebrowRow).columnGap)
    const contoursStyle = getComputedStyle(contours)
    // Every text box in the panel, for the contours to stay clear of.
    const texts = all.filter(
      (element) => element.firstChild instanceof Text && element.textContent!.trim() !== '' && box(element).width > 0,
    )
    return {
      tokens,
      section: section_,
      paper,
      background: getComputedStyle(section).backgroundColor,
      paddingTop: parseFloat(getComputedStyle(section).paddingTop),
      positioningPaddingBottom: parseFloat(getComputedStyle(positioning).paddingBottom),
      paddingBottom: parseFloat(getComputedStyle(section).paddingBottom),
      servicesPaddingTop: parseFloat(getComputedStyle(document.getElementById('services')!).paddingTop),
      gapAbove: box(panel).top - problemBottom,
      gapBelow: box(servicesFirst).top - box(panel).bottom,
      containerChildren: container.children.length,
      containerBottom: box(container).bottom,
      panel: {
        box: rect(panel),
        className: panel.className,
        background: panelStyle.backgroundColor,
        radius: panelStyle.borderTopLeftRadius,
        borders: borders(panelStyle),
        shadow: panelStyle.boxShadow,
        image: panelStyle.backgroundImage,
        padding: [panelStyle.paddingTop, panelStyle.paddingRight, panelStyle.paddingBottom, panelStyle.paddingLeft].map(parseFloat),
      },
      inner,
      rows: [intro, figure, receive, next].map((element) => element.classList[0]),
      intro: rect(intro),
      figure: rect(figure),
      receive: rect(receive),
      next: rect(next),
      eyebrowRow: {
        box: rect(eyebrowRow),
        tagName: eyebrowRow.tagName,
        hairline: {
          content: hairline.content,
          width: parseFloat(hairline.width),
          border: [hairline.borderTopWidth, hairline.borderTopStyle, hairline.borderTopColor],
          gap: hairlineLeft - box(eyebrow).right,
          right: hairlineLeft + parseFloat(hairline.width),
        },
        alignItems: getComputedStyle(eyebrowRow).alignItems,
      },
      eyebrow: {
        ...look(eyebrow),
        text: (eyebrow as HTMLElement).innerText,
        className: eyebrow.className,
        box: rect(eyebrow),
        before: getComputedStyle(eyebrow, '::before').content,
        after: getComputedStyle(eyebrow, '::after').content,
      },
      nameLine: {
        ...look(nameLine),
        tagName: nameLine.tagName,
        text: (nameLine as HTMLElement).innerText,
        box: rect(nameLine),
        borders: borders(getComputedStyle(nameLine)),
        padding: parseFloat(getComputedStyle(nameLine).paddingLeft),
      },
      h2: { ...look(h2), tagName: h2.tagName, text: (h2 as HTMLElement).innerText, box: rect(h2) },
      lead: { ...look(lead), box: rect(lead) },
      facts: {
        ...look(facts),
        tagName: facts.tagName,
        text: facts.textContent,
        box: rect(facts),
        borders: borders(getComputedStyle(facts)),
        radius: getComputedStyle(facts).borderTopLeftRadius,
        // Its text's own width, plus padding and border: the pill is as
        // wide as its text.
        fit: (() => {
          const range = document.createRange()
          range.selectNodeContents(facts)
          const style = getComputedStyle(facts)
          return (
            range.getBoundingClientRect().width +
            parseFloat(style.paddingLeft) +
            parseFloat(style.paddingRight) +
            parseFloat(style.borderLeftWidth) +
            parseFloat(style.borderRightWidth)
          )
        })(),
      },
      contours: {
        tagName: contours.tagName.toLowerCase(),
        display: contoursStyle.display,
        opacity: contoursStyle.opacity,
        color: contoursStyle.color,
        box: rect(contours),
        crossing: texts
          .filter((element) => {
            const [p, q] = [box(contours), box(element)]
            return p.height > 0 && !(p.right <= q.left || q.right <= p.left || p.bottom <= q.top || q.bottom <= p.top)
          })
          .map(name),
      },
      figureStyle: {
        background: figureStyle.backgroundColor,
        borders: borders(figureStyle),
        radius: figureStyle.borderTopLeftRadius,
        shadow: figureStyle.boxShadow,
        color: figureStyle.color,
      },
      figureContent: {
        left: box(figure).left + parseFloat(figureStyle.borderLeftWidth) + parseFloat(figureStyle.paddingLeft),
        right: box(figure).right - parseFloat(figureStyle.borderRightWidth) - parseFloat(figureStyle.paddingRight),
      },
      metrics: metrics.map((chip) => {
        const style = getComputedStyle(chip)
        return {
          text: chip.textContent,
          box: rect(chip),
          borders: borders(style),
          ...look(chip),
          radius: style.borderTopLeftRadius,
          cursor: style.cursor,
          tabIndex: (chip as HTMLElement).tabIndex,
        }
      }),
      stepsLabel: { box: rect(stepsLabel), ...look(stepsLabel) },
      steps: steps.map((step, i) => {
        const [stepName, description] = [...step.children]
        const ring = getComputedStyle(stepName, '::before')
        const dot = getComputedStyle(stepName, '::after')
        const segment = getComputedStyle(step, '::before')
        const stepBox = box(step)
        const line = firstLine(stepName)
        const ringTop = stepBox.top + parseFloat(ring.top)
        const ringLeft = stepBox.left + parseFloat(ring.left)
        const dotTop = stepBox.top + parseFloat(dot.top)
        const dotLeft = stepBox.left + parseFloat(dot.left)
        return {
          index: i,
          box: rect(step),
          name: { ...look(stepName), text: stepName.textContent, box: rect(stepName) },
          description: { ...look(description), text: description.textContent, box: rect(description) },
          ring: {
            content: ring.content,
            left: ringLeft,
            right: ringLeft + parseFloat(ring.width),
            width: parseFloat(ring.width),
            height: parseFloat(ring.height),
            centre: ringTop + parseFloat(ring.height) / 2,
            middle: ringLeft + parseFloat(ring.width) / 2,
            border: [ring.borderTopWidth, ring.borderTopStyle, ring.borderTopColor],
            background: ring.backgroundColor,
          },
          dot: {
            content: dot.content,
            width: parseFloat(dot.width),
            height: parseFloat(dot.height),
            centre: dotTop + parseFloat(dot.height) / 2,
            middle: dotLeft + parseFloat(dot.width) / 2,
            border: [dot.borderTopWidth, dot.borderTopStyle, dot.borderTopColor],
          },
          segment: {
            content: segment.content,
            top: stepBox.top + parseFloat(segment.top),
            bottom: stepBox.top + parseFloat(segment.top) + parseFloat(segment.height),
            middle: stepBox.left + parseFloat(segment.left) + parseFloat(segment.borderLeftWidth) / 2,
            border: [segment.borderLeftWidth, segment.borderLeftStyle, segment.borderLeftColor],
          },
          textLeft: line.left,
          textTop: line.top,
          textBottom: line.bottom,
        }
      }),
      ratingsTop: box(ratingsList).top,
      ratings: ratings.map((chip) => {
        const style = getComputedStyle(chip)
        const marker = getComputedStyle(chip, '::before')
        return {
          text: chip.textContent,
          box: rect(chip),
          borders: borders(style),
          ...look(chip),
          gap: style.columnGap,
          cursor: style.cursor,
          marker: {
            content: marker.content,
            width: parseFloat(marker.width),
            height: parseFloat(marker.height),
            borderWidth: parseFloat(marker.borderTopWidth),
            borderStyle: marker.borderTopStyle,
            borderColor: marker.borderTopColor,
            background: marker.backgroundColor,
            radius: marker.borderTopLeftRadius,
          },
        }
      }),
      receiveHeading: { ...look(receive.firstElementChild!), tagName: receive.firstElementChild!.tagName },
      receiveGap: box(receive.lastElementChild!).top - box(receive.firstElementChild!).bottom,
      tilesGap: [tilesStyle.rowGap, tilesStyle.columnGap].map(parseFloat),
      tiles: tiles.map((tile) => {
        const rule = getComputedStyle(tile, '::before')
        const [label, text] = [...tile.children]
        return {
          box: rect(tile),
          background: getComputedStyle(tile).backgroundColor,
          borders: borders(getComputedStyle(tile)),
          radius: getComputedStyle(tile).borderTopLeftRadius,
          rule: {
            width: parseFloat(rule.width),
            border: [rule.borderTopWidth, rule.borderTopStyle, rule.borderTopColor],
            marginBottom: parseFloat(rule.marginBottom),
          },
          label: { ...look(label), text: label.textContent },
          text: { ...look(text), text: text.textContent },
        }
      }),
      nextStyle: {
        hairline: [nextStyle.borderTopWidth, nextStyle.borderTopStyle, nextStyle.borderTopColor],
        otherBorders: [nextStyle.borderRightStyle, nextStyle.borderBottomStyle, nextStyle.borderLeftStyle],
        paddingTop: parseFloat(nextStyle.paddingTop),
        background: nextStyle.backgroundColor,
      },
      nextChildren: [...next.children].map((child) => child.tagName),
      nextTextChildren: [...nextText.children].map((child) => child.tagName),
      nextText: rect(nextText),
      nextEyebrow: {
        ...look(nextEyebrow),
        text: (nextEyebrow as HTMLElement).innerText,
        className: nextEyebrow.className,
        box: rect(nextEyebrow),
      },
      statement: { ...look(statement), tagName: statement.tagName, box: rect(statement) },
      supporting: { ...look(supporting), box: rect(supporting) },
      button: {
        box: rect(button),
        href: button.getAttribute('href'),
        text: button.textContent,
        color: getComputedStyle(button).color,
        background: getComputedStyle(button).backgroundColor,
      },
      weights: [...section.querySelectorAll('*')].map((element) => getComputedStyle(element).fontWeight),
      overlaps,
      outside: all
        .filter((element) => {
          const b = box(element)
          if (b.width === 0 && b.height === 0) return false
          return b.left < inner.left - 1 || b.right > inner.right + 1
        })
        .map((element) => `${element.tagName}.${element.getAttribute('class')}`),
      clipped: all
        .filter((element) => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== 'inline')
        .map((element) => `${element.tagName}.${element.getAttribute('class')}`),
      broken: all.flatMap(brokenWords),
      sectionScroll: section.scrollWidth,
      sectionWidth: section.clientWidth,
    }
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

    test(`all three Solutions rows open at ${width}px`, async ({ page }, testInfo) => {
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
    // (85svh); below it, its natural height, with its one call to action
    // on the first screen (the projects' viewport is 800px tall).
    test(`hero height and call to action at scroll 0 at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const m = await page.evaluate(() => {
        const hero = document.querySelector('main > [data-header-overlay]')!
        const links = [...hero.querySelectorAll('a')]
        const [primary] = links.map((link) => link.getBoundingClientRect())
        const { top, height } = hero.getBoundingClientRect()
        return {
          top,
          height,
          minBlockSize: getComputedStyle(hero).minBlockSize,
          links: links.length,
          primaryBottom: primary.bottom,
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
      expect(m.links, detail).toBe(1)
      expect(m.primaryBottom, detail).toBeLessThanOrEqual(m.viewport)
      await expect(heroRegion(page).getByRole('link', { name: 'Book a data trust assessment', exact: true })).toBeInViewport({ ratio: 1 })
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
          // Long enough to wrap to three lines at the 17px titles (#66).
          heading.textContent = 'Data Warehousing, Lakehouse, Semantic Layer & Analytics Modelling Services'
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

    // The problem block, laid out as W10 in the trust and lineage plan
    // (#80, replacing #79's two columns): centred, top to bottom, the
    // eyebrow THE PROBLEM between two teal hairlines, the statement large
    // and light in two tones, then a row of the framing paragraph and the
    // bridge line (the transition), as wide as the statement and centred
    // under it. From 48em the two sit side by side with a graphite 200
    // hairline between them, --space-8 from each; below it they stack,
    // the hairline horizontal. The gap from the block's lowest content to
    // the assessment's eyebrow is one section padding (#71), and nothing
    // overflows, overlaps or (at 100% text) breaks mid-word, at the
    // default page text size and at 200%. The 360px project also checks
    // 390px.
    for (const text of ['100%', '200%'] as const) {
      test(`positioning section layout, spacing and wrapping with ${text} text at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        if (text !== '100%') {
          await page.addStyleTag({ content: `html { font-size: ${text}; }` })
          await expect
            .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
            .toBe('32px')
          await waitForFonts(page)
        }
        for (const w of width === 360 ? [360, 390] : [width]) {
          if (w !== width) await page.setViewportSize({ width: w, height: page.viewportSize()!.height })
          await checkProblemBlock(page, w, text)
        }
        // Every other eyebrow is as it was: no hairlines, not centred.
        const others = await page.evaluate(() =>
          [...document.querySelectorAll('.section-eyebrow')]
            .filter((eyebrow) => !eyebrow.closest('.positioning'))
            .map((eyebrow) => ({
              text: eyebrow.textContent,
              before: getComputedStyle(eyebrow, '::before').content,
              after: getComputedStyle(eyebrow, '::after').content,
              display: getComputedStyle(eyebrow).display,
              align: getComputedStyle(eyebrow).textAlign,
            })),
        )
        expect(others.length).toBeGreaterThan(0)
        for (const other of others) {
          expect(other, JSON.stringify(other)).toMatchObject({ before: 'none', after: 'none', display: 'block' })
          expect(other.align, JSON.stringify(other)).not.toBe('center')
        }
        // In forced-colours mode the eyebrow's hairlines and the row's
        // divider are still drawn: they are borders.
        if (text === '100%') {
          await page.emulateMedia({ forcedColors: 'active' })
          const forced = await page.evaluate(() => {
            const eyebrow = document.querySelector('.positioning .section-eyebrow')!
            const bridge = document.querySelectorAll('.positioning p')[3]
            const line = (s: CSSStyleDeclaration, side: 'Top' | 'Left') => ({
              width: s.getPropertyValue(`border-${side.toLowerCase()}-width`),
              style: s.getPropertyValue(`border-${side.toLowerCase()}-style`),
              color: s.getPropertyValue(`border-${side.toLowerCase()}-color`),
            })
            return [
              line(getComputedStyle(eyebrow, '::before'), 'Top'),
              line(getComputedStyle(eyebrow, '::after'), 'Top'),
              line(getComputedStyle(bridge), window.innerWidth >= 768 ? 'Left' : 'Top'),
            ]
          })
          for (const line of forced) {
            expect(line.width, JSON.stringify(forced)).toBe('1px')
            expect(line.style, JSON.stringify(forced)).toBe('solid')
            expect(line.color, JSON.stringify(forced)).not.toBe('rgba(0, 0, 0, 0)')
          }
          await page.emulateMedia({ forcedColors: 'none' })
        }
        // At 1024px with 200% page text the header's inline navigation is
        // wider than the page (noted on #71); everywhere else the page fits.
        if (!(width === 1024 && text === '200%')) await expectNoHorizontalScroll(page)
      })
    }

    // The Data Trust Assessment (#71), on paper between the problem
    // block and Services: one --space-section gap above and below its
    // panel, never doubled or zero. Laid out by the dark panel plan (#82)
    // as one graphite 900 panel inset in the container, in three rows:
    // the intro (the eyebrow row with its hairline, the name, the h2, the
    // lead, the facts pill and, from 64em, the contour lines) and the white
    // card, side by side from 64em; the four tiles; and, after a hairline,
    // the closing strip with the button. The card's chips wrap, its seven
    // steps have rings, dots and one joining line, and nothing overflows,
    // clips, overlaps or breaks mid-word, at the default page text size
    // and at 200%. A media query in em follows the browser's text size,
    // not page text, so with 200% page text the columns stay as at 100%.
    for (const text of ['100%', '200%'] as const) {
      test(`Data Trust Assessment layout, spacing and wrapping with ${text} text at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        if (text !== '100%') {
          await page.addStyleTag({ content: `html { font-size: ${text}; }` })
          await expect
            .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
            .toBe('32px')
          await waitForFonts(page)
          // The section's own text has doubled too, not only the root's
          // (a rare Chromium run measured the section at 100%, #82).
          await expect
            .poll(() =>
              page.evaluate(() => getComputedStyle(document.querySelector('#data-trust-assessment .section-eyebrow')!).fontSize),
            )
            .toBe('26px')
        }
        const m = await measureAssessment(page)
        const t = m.tokens
        const d = t.dark
        const l = t.light
        const detail = JSON.stringify(m)
        const near = (a: number, b: number, tolerance = 1) => Math.abs(a - b) <= tolerance

        // The section on paper; the panel graphite 900, with --radius-lg
        // corners and no border, shadow, grid or image, the container's
        // only child.
        expect(m.background, detail).toBe(m.paper)
        expect(m.containerChildren, detail).toBe(1)
        expect(m.panel.className, detail).toContain('surface-dark')
        expect(m.panel.background, detail).toBe('rgb(28, 32, 36)')
        expect(m.panel.background, detail).toBe(d.bg)
        expect(m.panel.radius, detail).toBe('12px')
        expect(m.panel.borders, detail).toMatch(/^0px none/)
        expect([m.panel.shadow, m.panel.image], detail).toEqual(['none', 'none'])
        expect(near(m.containerBottom, m.panel.box.bottom), detail).toBe(true)
        // One section gap above, split between the problem block's bottom
        // padding and this section's own top padding, so the panel lands
        // clear of the header; and one below (this section's).
        expect(m.paddingTop, detail).toBeGreaterThan(0)
        expect(m.paddingTop, detail).toBeLessThan(m.section)
        expect(near(m.paddingTop, t.space8), detail).toBe(true)
        expect(near(m.positioningPaddingBottom + m.paddingTop, m.section), detail).toBe(true)
        expect(m.servicesPaddingTop, detail).toBe(0)
        expect(near(m.paddingBottom, m.section), detail).toBe(true)
        expect(near(m.gapAbove, m.section), `gap above: ${detail}`).toBe(true)
        expect(near(m.gapBelow, m.section), `gap below: ${detail}`).toBe(true)
        expect(m.section, detail).toBeGreaterThanOrEqual(64)
        // The panel's padding: --space-8 and the 8 to 24px inset below
        // 48em, --space-10 from it and --space-16 from 64em.
        const inset = Math.min(Math.max(8, 48 - t.space6), t.space6)
        const padding = width >= 1024 ? Array(4).fill(t.space16) : width >= 768 ? Array(4).fill(t.space10) : [t.space8, inset, t.space8, inset]
        m.panel.padding.forEach((value, i) => expect(near(value, padding[i], 0.5), detail).toBe(true))

        // The rows, in DOM and visual order: intro and card, tiles, strip.
        expect(m.rows, detail).toEqual([
          'trust-assessment__intro',
          'lineage-example',
          'trust-assessment__receive',
          'trust-assessment__next',
        ])
        const rowGap = width >= 1024 ? t.space16 : t.space12
        expect(near(m.intro.top, m.inner.top), detail).toBe(true)
        if (width >= 1024) {
          // Two columns, --space-16 apart, tops level. The intro is the
          // wider, as in the owner's reference image (8 : 7).
          expect(near(m.figure.left - m.intro.right, t.space16), detail).toBe(true)
          expect(near(m.figure.top, m.intro.top), detail).toBe(true)
          expect(m.intro.width / m.figure.width, detail).toBeCloseTo(8 / 7, 1)
          // The intro does not run far past the card.
          if (text === '100%') expect(m.intro.bottom - m.figure.bottom, detail).toBeLessThanOrEqual(t.space12)
          expect(near(m.receive.top - Math.max(m.intro.bottom, m.figure.bottom), rowGap), detail).toBe(true)
          expect(near(m.receive.left, m.intro.left) && near(m.receive.right, m.figure.right), detail).toBe(true)
        } else {
          // The card below the intro, at the panel's full content width.
          expect(near(m.figure.top - m.intro.bottom, t.space12), detail).toBe(true)
          expect(near(m.figure.left, m.inner.left) && near(m.figure.right, m.inner.right), detail).toBe(true)
          expect(near(m.receive.top - m.figure.bottom, rowGap), detail).toBe(true)
        }
        expect(near(m.receive.left, m.inner.left) && near(m.receive.right, m.inner.right), detail).toBe(true)
        // The strip: a graphite 700 hairline across the panel's content
        // width, --space-12 above its eyebrow from 64em, --space-8 below.
        expect(near(m.next.top - m.receive.bottom, rowGap), detail).toBe(true)
        expect(near(m.next.left, m.inner.left) && near(m.next.right, m.inner.right), detail).toBe(true)
        expect(near(m.next.bottom, m.inner.bottom), detail).toBe(true)
        expect(m.nextStyle.hairline, detail).toEqual(['1px', 'solid', d.border])
        expect(m.nextStyle.otherBorders, detail).toEqual(['none', 'none', 'none'])
        expect(m.nextStyle.background, detail).toBe('rgba(0, 0, 0, 0)')
        expect(near(m.nextStyle.paddingTop, width >= 1024 ? t.space12 : t.space8), detail).toBe(true)
        expect(near(m.nextEyebrow.box.top - m.next.top - 1, m.nextStyle.paddingTop), detail).toBe(true)

        // START WITH TRUST in teal 400, a short graphite 700 hairline after
        // it (drawn by its row, so the eyebrow has no ::before or ::after),
        // then DATA TRUST ASSESSMENT in paper as plain text, then the h2.
        expect(m.eyebrowRow.tagName, detail).toBe('DIV')
        expect([m.eyebrow.className, m.eyebrow.text], detail).toEqual(['section-eyebrow', 'START WITH TRUST'])
        expect([m.eyebrow.before, m.eyebrow.after], detail).toEqual(['none', 'none'])
        expect(m.eyebrow.color, detail).toBe('rgb(60, 194, 180)')
        expect(m.eyebrow.color, detail).toBe(d.accentText)
        expect(m.eyebrowRow.alignItems, detail).toBe('center')
        expect(m.eyebrowRow.hairline.content, detail).toBe('""')
        expect(m.eyebrowRow.hairline.border, detail).toEqual(['1px', 'solid', d.border])
        expect(near(m.eyebrowRow.hairline.gap, t.space3), detail).toBe(true)
        expect(m.eyebrowRow.hairline.width, detail).toBeLessThanOrEqual(t.space24 + 0.5)
        expect(m.eyebrowRow.hairline.right, detail).toBeLessThanOrEqual(m.intro.right + 1)
        if (text === '100%') expect(m.eyebrowRow.hairline.width, detail).toBeGreaterThan(0)
        expect([m.nameLine.tagName, m.nameLine.text], detail).toEqual(['P', 'DATA TRUST ASSESSMENT'])
        expect([m.nameLine.color, m.nameLine.background], detail).toEqual([d.heading, 'rgba(0, 0, 0, 0)'])
        expect(m.nameLine.borders, detail).toMatch(/^0px none/)
        expect(m.nameLine.padding, detail).toBe(0)
        expect(near(m.nameLine.box.top - m.eyebrowRow.box.bottom, t.space2), detail).toBe(true)
        for (const label of [m.eyebrow, m.nameLine]) {
          expect(label.size, detail).toBe(t.eyebrow)
          expect(label.weight, detail).toBe('500')
          expect(label.transform, detail).toBe('uppercase')
          expect(label.tracking, detail).toBeCloseTo(0.08, 2)
          expect(m.h2.size, detail).toBeGreaterThanOrEqual(2 * label.size)
        }
        expect([m.h2.tagName, m.h2.text.replace(/\s+/g, ' ')], detail).toEqual(['H2', 'Know where every number comes from.'])
        expect([m.h2.weight, m.h2.color], detail).toEqual(['300', d.heading])
        expect(near(m.h2.box.top - m.nameLine.box.bottom, t.space6), detail).toBe(true)
        // The lead in graphite 400, no wider than --measure.
        expect([m.lead.color, m.lead.weight], detail).toEqual([d.muted, '400'])
        expect(m.lead.color, detail).toBe('rgb(147, 157, 167)')
        expect(near(m.lead.box.top - m.h2.box.bottom, t.space6), detail).toBe(true)
        expect(m.lead.box.width, detail).toBeLessThanOrEqual(t.measure + 1)
        // The facts pill: paper text in a thin graphite 700 outline, as
        // wide as its text.
        expect([m.facts.tagName, m.facts.text], detail).toEqual(['P', '3 weeks · fixed fee'])
        expect([m.facts.size, m.facts.weight, m.facts.color], detail).toEqual([t.sm, '400', d.heading])
        expect(m.facts.borders, detail).toBe(Array(4).fill(`1px solid ${d.border}`).join(' | '))
        expect(m.facts.radius, detail).toBe('9999px')
        expect(near(m.facts.box.top - m.lead.box.bottom, t.space8), detail).toBe(true)
        if (text === '100%') expect(near(m.facts.box.width, m.facts.fit, 1.5), detail).toBe(true)
        // The contour lines: from 64em, faint teal 400 below the pill,
        // within the intro and crossing no text; not drawn below it.
        expect(m.contours.tagName, detail).toBe('svg')
        if (width >= 1024) {
          expect(m.contours.display, detail).toBe('block')
          expect(m.contours.color, detail).toBe(d.accent)
          expect(Number(m.contours.opacity), detail).toBeCloseTo(0.4, 2)
          expect(m.contours.box.top - m.facts.box.bottom, detail).toBeGreaterThanOrEqual(t.space8 - 1)
          expect(m.contours.box.left, detail).toBeGreaterThanOrEqual(m.intro.left - 1)
          expect(m.contours.box.right, detail).toBeLessThanOrEqual(m.intro.right + 1)
          expect(m.contours.box.bottom, detail).toBeLessThanOrEqual(m.intro.bottom + 1)
          expect(m.contours.box.bottom, detail).toBeLessThanOrEqual(m.receive.top)
          if (text === '100%') expect(m.contours.box.height, detail).toBeGreaterThan(0)
          expect(m.contours.crossing, detail).toEqual([])
        } else {
          expect(m.contours.display, detail).toBe('none')
        }

        // The card: white, --radius-lg, a transparent border and no
        // shadow; its text resets to graphite 900.
        expect(m.figureStyle.background, detail).toBe('rgb(255, 255, 255)')
        expect(m.figureStyle.background, detail).toBe(l.surface)
        expect(m.figureStyle.borders, detail).toBe(Array(4).fill('1px solid rgba(0, 0, 0, 0)').join(' | '))
        expect([m.figureStyle.radius, m.figureStyle.shadow, m.figureStyle.color], detail).toEqual(['12px', 'none', l.text])
        // The five metric chips, all alike: a graphite 200 outline on
        // white, graphite 900 text, none selected and none a button.
        expect(m.metrics.map((chip) => chip.text), detail).toEqual(['Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer'])
        for (const chip of m.metrics) {
          expect([chip.size, chip.weight, chip.radius, chip.cursor, chip.tabIndex], detail).toEqual([t.sm, '500', '9999px', 'auto', -1])
          expect(chip.borders, detail).toBe(Array(4).fill(`1px solid ${l.border}`).join(' | '))
          expect([chip.color, chip.background], detail).toEqual([l.heading, l.surface])
          expect(chip.box.left, detail).toBeGreaterThanOrEqual(m.figureContent.left - 1)
          expect(chip.box.right, detail).toBeLessThanOrEqual(m.figureContent.right + 1)
          if (text === '100%') expect(near(chip.box.height, m.metrics[0].box.height), detail).toBe(true)
        }

        // The trace: its label, then the seven steps, each a ringed
        // marker level with its name's first line and the description
        // below the name. Report to Source system teal, Owner and Trust
        // rating ink with a muted name. One graphite 200 line joins the
        // markers' centres.
        expect([m.stepsLabel.color, m.stepsLabel.size, m.stepsLabel.weight], detail).toEqual([l.muted, t.sm, '500'])
        expect(m.steps.map((step) => step.name.text), detail).toEqual([
          'Report',
          'Definition',
          'Calculation',
          'Data model',
          'Source system',
          'Owner',
          'Trust rating',
        ])
        expect(m.steps.map((step) => step.description.text), detail).toEqual([
          'The leadership report where the number appears',
          'How the number is defined',
          'The logic and rules that produce it',
          'The tables the calculation reads from',
          'Where the data is first recorded',
          'Who is accountable for the number',
          'How far the number can be trusted, and why',
        ])
        const ring = Math.min(t.space4, 16)
        m.steps.forEach((step, i) => {
          const where = `step ${i + 1}: ${detail}`
          const attribute = i >= 5
          const marker = attribute ? l.heading : l.accent
          expect(near(step.box.left, m.stepsLabel.box.left), where).toBe(true)
          if (i > 0) expect(step.box.top, where).toBeGreaterThanOrEqual(m.steps[i - 1].box.bottom - 1)
          expect([step.name.size, step.name.weight, step.name.color], where).toEqual([t.base, '400', attribute ? l.muted : l.heading])
          expect(step.name.lineHeight, where).toBeCloseTo(1.3, 2)
          expect([step.description.size, step.description.weight, step.description.color], where).toEqual([t.sm, '400', l.muted])
          expect(step.description.box.top, where).toBeGreaterThanOrEqual(step.name.box.bottom - 1)
          expect(near(step.description.box.left, step.name.box.left), where).toBe(true)
          // The ring: --space-4 at the default text size, no larger with
          // 200%, filled white, at the step's inline start.
          expect(step.ring.content, where).toBe('""')
          expect(near(step.ring.left, step.box.left), where).toBe(true)
          expect(step.ring.right, where).toBeLessThanOrEqual(step.textLeft)
          expect([step.ring.width, step.ring.height], where).toEqual([ring, ring])
          expect(step.ring.background, where).toBe(l.surface)
          expect(step.ring.border, where).toEqual(['2px', 'solid', marker])
          expect(step.ring.centre, where).toBeGreaterThan(step.textTop)
          expect(step.ring.centre, where).toBeLessThan(step.textBottom)
          // The solid dot, 6px, centred in the ring.
          expect(step.dot.content, where).toBe('""')
          expect([step.dot.width, step.dot.height], where).toEqual([6, 6])
          expect(step.dot.border, where).toEqual(['3px', 'solid', marker])
          expect(near(step.dot.centre, step.ring.centre) && near(step.dot.middle, step.ring.middle), where).toBe(true)
          // The line: each step but the last draws the segment from its
          // marker's centre to the next one's, so the segments join.
          if (i < m.steps.length - 1) {
            expect(step.segment.content, where).toBe('""')
            expect(step.segment.border, where).toEqual(['1px', 'solid', l.border])
            expect(near(step.segment.middle, step.ring.middle), where).toBe(true)
            expect(near(step.segment.top, step.ring.centre), where).toBe(true)
            expect(near(step.segment.bottom, m.steps[i + 1].ring.centre, 1.5), where).toBe(true)
          } else {
            expect(step.segment.content, where).toBe('none')
          }
        })

        // The three rating chips, --space-6 below the last step: Trusted
        // in the teal tint with a teal dot, Trusted with caveats with an
        // amber dot and Not yet trusted with a hollow ring, each beside
        // its text, --space-2 from it.
        expect(near(m.ratingsTop - m.steps[6].box.bottom, t.space6), detail).toBe(true)
        expect(m.ratings.map((rating) => rating.text), detail).toEqual(['Trusted', 'Trusted with caveats', 'Not yet trusted'])
        expect(m.ratings.map(({ borders, background, color }) => ({ borders, background, color })), detail).toEqual([
          { borders: Array(4).fill('1px solid rgba(0, 0, 0, 0)').join(' | '), background: l.tagBg, color: l.tagText },
          { borders: Array(4).fill(`1px solid ${l.border}`).join(' | '), background: l.surface, color: l.heading },
          { borders: Array(4).fill(`1px solid ${l.border}`).join(' | '), background: l.surface, color: l.heading },
        ])
        expect([m.ratings[0].color, m.ratings[0].background], detail).toEqual(['rgb(15, 90, 82)', 'rgb(214, 244, 240)'])
        for (const rating of m.ratings) {
          expect([rating.weight, rating.size], detail).toEqual(['500', t.sm])
          expect(rating.cursor, detail).not.toBe('pointer')
          expect(parseFloat(rating.gap), detail).toBe(t.space2)
          expect([rating.marker.content, rating.marker.width, rating.marker.height, rating.marker.borderStyle, rating.marker.radius], detail).toEqual(['""', t.space2, t.space2, 'solid', '9999px'])
          expect(rating.marker.background, detail).toBe('rgba(0, 0, 0, 0)')
          expect(rating.box.left, detail).toBeGreaterThanOrEqual(m.figureContent.left - 1)
          expect(rating.box.right, detail).toBeLessThanOrEqual(m.figureContent.right + 1)
        }
        expect(m.ratings.map((rating) => [rating.marker.borderWidth, rating.marker.borderColor]), detail).toEqual([
          [t.space2 / 2, l.accent],
          [t.space2 / 2, l.warning],
          [2, l.muted],
        ])

        // What you receive: the h3 at weight 300 in paper, then the
        // tiles, --space-6 apart, 4 per row from 64em, 2 from 48em and 1
        // below, equal and level in each row. With 200% page text a row
        // holds fewer when a tile would be too narrow, so no word breaks.
        expect(m.receiveHeading.tagName, detail).toBe('H3')
        expect([m.receiveHeading.weight, m.receiveHeading.color, m.receiveHeading.size], detail).toEqual(['300', d.heading, t.xl2])
        expect(m.receiveHeading.transform, detail).toBe('none')
        expect(near(m.receiveGap, t.space6), detail).toBe(true)
        expect(m.tilesGap, detail).toEqual([t.space6, t.space6])
        const target = width >= 1024 ? 4 : width >= 768 ? 2 : 1
        const perRow = m.tiles.filter((tile) => near(tile.box.top, m.tiles[0].box.top)).length
        if (text === '100%') expect(perRow, detail).toBe(target)
        else expect(perRow, detail).toBeLessThanOrEqual(target)
        for (let start = 0; start < m.tiles.length; start += perRow) {
          const row = m.tiles.slice(start, start + perRow)
          for (const tile of row) {
            expect(near(tile.box.top, row[0].box.top), detail).toBe(true)
            expect(near(tile.box.width, row[0].box.width), detail).toBe(true)
            expect(near(tile.box.height, row[0].box.height), detail).toBe(true)
          }
          for (let i = 1; i < row.length; i++) expect(near(row[i].box.left - row[i - 1].box.right, t.space6), detail).toBe(true)
          if (start > 0) expect(near(row[0].box.top - m.tiles[start - 1].box.bottom, t.space6), detail).toBe(true)
        }
        expect(m.tiles.map((tile) => tile.label.text), detail).toEqual(['Lineage map', 'Trust scorecard', 'Shared definitions', 'Fix list'])
        for (const tile of m.tiles) {
          // Graphite 800 with a graphite 700 outline, --radius-md.
          expect(tile.background, detail).toBe('rgb(42, 48, 54)')
          expect(tile.background, detail).toBe(d.surface)
          expect(tile.borders, detail).toBe(Array(4).fill(`1px solid ${d.border}`).join(' | '))
          expect(tile.radius, detail).toBe('8px')
          expect([tile.rule.width, ...tile.rule.border], detail).toEqual([t.space8, '2px', 'solid', d.accent])
          expect(tile.rule.marginBottom, detail).toBe(t.space4)
          expect([tile.label.size, tile.label.weight, tile.label.color], detail).toEqual([t.base, '500', d.heading])
          expect([tile.text.size, tile.text.weight, tile.text.color], detail).toEqual([t.sm, '400', d.muted])
        }

        // The closing strip: WHAT HAPPENS NEXT in the eyebrow's teal, the
        // statement h3 at weight 300 in paper, the paragraph in graphite
        // 400, each --space-3 apart; then the primary button on dark,
        // on the right and centred from 48em, full width below the
        // paragraph below it.
        expect(m.nextChildren, detail).toEqual(['DIV', 'DIV'])
        expect(m.nextTextChildren, detail).toEqual(['P', 'H3', 'P'])
        expect([m.nextEyebrow.className, m.nextEyebrow.text], detail).toEqual(['section-eyebrow', 'WHAT HAPPENS NEXT'])
        expect([m.nextEyebrow.color, m.nextEyebrow.size, m.nextEyebrow.weight, m.nextEyebrow.transform], detail).toEqual([d.accentText, t.eyebrow, '500', 'uppercase'])
        expect([m.statement.tagName, m.statement.weight, m.statement.color, m.statement.size], detail).toEqual(['H3', '300', d.heading, t.xl2])
        expect(near(m.statement.box.top - m.nextEyebrow.box.bottom, t.space3), detail).toBe(true)
        expect([m.supporting.size, m.supporting.weight, m.supporting.color], detail).toEqual([t.base, '400', d.muted])
        expect(near(m.supporting.box.top - m.statement.box.bottom, t.space3), detail).toBe(true)
        expect(m.supporting.box.width, detail).toBeLessThanOrEqual(t.measure + 1)
        expect([m.button.href, m.button.text], detail).toEqual(['#contact', 'Book a data trust assessment→'])
        expect([m.button.color, m.button.background], detail).toEqual([d.buttonText, d.buttonBg])
        expect(m.button.background, detail).toBe('rgb(60, 194, 180)')
        // From 48em the button is on the right, centred against the text
        // group; with 200% page text it wraps below when the two do not
        // fit. Below 48em it is full width under the paragraph.
        const beside = m.button.box.top < m.nextText.bottom
        if (width >= 768 && text === '100%') expect(beside, detail).toBe(true)
        if (beside) {
          expect(width, detail).toBeGreaterThanOrEqual(768)
          expect(m.button.box.left, detail).toBeGreaterThan(m.nextText.right)
          const centre = (b: { top: number; height: number }) => b.top + b.height / 2
          expect(near(centre(m.button.box), centre(m.nextText), 1.5), detail).toBe(true)
        } else {
          expect(m.button.box.top - m.supporting.box.bottom, detail).toBeGreaterThanOrEqual(t.space6 - 1)
          expect(near(m.button.box.left, m.supporting.box.left), detail).toBe(true)
        }
        if (width < 768) expect(near(m.button.box.width, m.next.width), detail).toBe(true)

        // Weights 300, 400 and 500 only.
        for (const weight of m.weights) expect(['300', '400', '500'], detail).toContain(weight)
        // Each block below the one before it, never over it, and no two
        // chips or tiles over each other.
        expect(m.overlaps, detail).toEqual([])
        // Every element inside the panel's content box, none wider than
        // its own box, and no word broken mid-word.
        expect(m.outside, detail).toEqual([])
        expect(m.clipped, detail).toEqual([])
        expect(m.broken, detail).toEqual([])
        expect(m.sectionScroll, detail).toBeLessThanOrEqual(m.sectionWidth)
        // At 1024px with 200% page text the header's inline navigation,
        // which starts at 64em of the browser's text size, is wider than
        // the page; that is the header's, not this section's (noted on
        // #71). Everywhere else the whole page fits.
        if (!(width === 1024 && text === '200%')) await expectNoHorizontalScroll(page)
      })
    }

    if (width === 1440) {
      // The Data Trust Assessment's chips (#77, #81), the five metrics and
      // the three ratings, are labels, not buttons: hovering one changes
      // nothing about any of them.
      test(`Data Trust Assessment chips do not change on hover at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        const figure = page.locator('#data-trust-assessment figure')
        const chips = figure.locator('ul > li')
        await expect(chips).toHaveCount(8)
        await expect(figure.getByRole('list', { name: 'Trust rating' }).getByRole('listitem')).toHaveCount(3)
        const look = () =>
          chips.evaluateAll((items) =>
            items.map((item) => {
              const style = getComputedStyle(item)
              return [style.borderTopColor, style.borderTopWidth, style.backgroundColor, style.color, style.fontWeight, style.cursor, style.transform, style.boxShadow, style.textDecorationLine, style.outlineStyle]
            }),
          )
        await chips.first().scrollIntoViewIfNeeded()
        const resting = await look()
        for (let i = 0; i < 8; i++) {
          await chips.nth(i).hover()
          expect(await look()).toEqual(resting)
        }
        expect(resting.every((style) => style[5] !== 'pointer')).toBe(true)
      })

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

    // The connected data operating system diagram (#57, #63, #66): after
    // the card grid and before the managed-services block, stacked below
    // 768px, two columns from 768px and three from 1024px, every layer the
    // same shape with the cards lined up, no overflow, no word broken
    // across lines, a chevron in every gap, and the return loop from the
    // activation layer back into the first, with the return statement.
    test(`system diagram is ${flowShapeAt(width)}, after the cards, at ${width}px`, async ({ page, browserName }, testInfo) => {
      await open(page, testInfo, width)
      const flow = flowList(page)
      await expect(flow.locator(':scope > li')).toHaveCount(6)

      expectFlow(await measureFlow(page), `${width}px`, { shape: flowShapeAt(width) })

      const gridBox = await serviceList(page).boundingBox()
      const flowBox = await flowDiagram(page).boundingBox()
      const managedBox = await page.locator('#managed-services').boundingBox()
      if (!gridBox || !flowBox || !managedBox) throw new Error('The grid, diagram or block has no box')
      expect(flowBox.y, 'below the cards').toBeGreaterThan(gridBox.y + gridBox.height)
      expect(managedBox.y, 'above the managed-services block').toBeGreaterThan(flowBox.y + flowBox.height)
      // The full container width, like the card grid.
      expect(Math.abs(flowBox.x - gridBox.x), 'left edge').toBeLessThanOrEqual(1)
      expect(Math.abs(flowBox.width - gridBox.width), 'width').toBeLessThanOrEqual(1)
      await expectNoHorizontalScroll(page)

      await flowDiagram(page).screenshot({
        path: `${testInfo.project.outputDir}/screenshots/${browserName}-system-flow-${width}.png`,
      })
    })

    // Every width from 320 to 1440px, one pixel at a time, at the default
    // text size and with 200% and 150% page text (enlarged page text does
    // not move the 48em and 64em media queries; the diagram's rem container
    // queries keep it in a narrower layout): one shape for every layer, the
    // expected one at the default size, cards lined up, nothing
    // overflowing, no word broken across lines, every chevron in its gap
    // and the loop joined from the last layer to the first. Run from the
    // 768px projects, in Chromium and WebKit. With enlarged page text only
    // the diagram is checked for overflow, not the page: the header's
    // inline nav overflows at 1024px with 200% page text (#65).
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
            // the measure waits two frames first, in the same call.
            const problems = flowProblems(
              await measureFlow(page, { settle: true }),
              text === '100%' ? { shape: flowShapeAt(w) } : { page: false },
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
    // Services' bottom padding alone, as the Data Trust Assessment to
    // Services is (#71; Positioning to Services before it).
    test(`one section padding above the managed-services panel at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const m = await page.evaluate(() => {
        const services = document.getElementById('services')!
        const section = document.getElementById('managed-services')!
        const panel = section.querySelector('.surface-dark')!
        const servicesContent = services.querySelector(':scope > .container')!
        const assessmentContent = document.querySelector('#data-trust-assessment > .container')!
        return {
          gap: panel.getBoundingClientRect().top - servicesContent.getBoundingClientRect().bottom,
          servicesPadding: parseFloat(getComputedStyle(services).paddingBottom),
          sectionPadding: parseFloat(getComputedStyle(section).paddingTop),
          rhythm:
            servicesContent.getBoundingClientRect().top -
            assessmentContent.getBoundingClientRect().bottom,
        }
      })
      const detail = JSON.stringify(m)
      expect(m.sectionPadding, detail).toBe(0)
      expect(m.servicesPadding, detail).toBeGreaterThanOrEqual(64)
      expect(Math.abs(m.gap - m.servicesPadding), detail).toBeLessThanOrEqual(1)
      expect(Math.abs(m.gap - m.rhythm), `same as the Data Trust Assessment to Services: ${detail}`).toBeLessThanOrEqual(1)
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
      await expect(sectorButtons(page)).toHaveCount(3)

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
      // Compact: no taller than one title line height + --space-12 per
      // row (three rows since #73).
      if (width === 1440) {
        const limit = 3 * (closed.rows[0].titleLineHeight + 48)
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
        expect(row.themes.map((theme) => theme.text)).toEqual(homepageSolutions[index].themes)
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

        // A mouse click on the summary toggles nothing. A tap there may
        // toggle the row: in WebKit, touch adjustment sends a tap on or
        // near the summary to the button, as Safari on iOS does, and
        // Chromium does not (owner decision on #59: the summary criterion
        // applies to mouse clicks only). The test below checks that such a
        // tap changes no other row.
        await sectorButtons(page).nth(1).locator('xpath=../../ul[1]/li[1]').click()
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        await button.locator('.solution-row__title').tap()
        await expect(button).toHaveAttribute('aria-expanded', 'false')
        for (const other of [0, 2]) {
          await expect(sectorButtons(page).nth(other)).toHaveAttribute('aria-expanded', 'false')
        }
      })
    })

    // A tap on a row's summary (owner decision on #59) opens or closes
    // that row, or leaves it as it was, and changes no other row. WebKit's
    // touch adjustment may send the tap to the row's button; Chromium's
    // does not. With three rows (#73), the first is open and the second
    // closed first, so a tap that reached either would show.
    if (width === 360 || width === 1440) {
      test.describe('touch on the summary', () => {
        test.use({ hasTouch: true })

        test(`a tap on a Solutions summary changes only that row at ${width}px`, async ({ page }, testInfo) => {
          await open(page, testInfo, width)
          const buttons = sectorButtons(page)
          await expect(buttons).toHaveCount(3)
          for (const index of [0]) {
            await buttons.nth(index).locator('.solution-row__title').tap()
            await expect(buttons.nth(index)).toHaveAttribute('aria-expanded', 'true')
          }
          const others = { 0: 'true', 1: 'false' } as const
          const target = buttons.nth(2)
          const panel = page.locator(`[id="${await target.getAttribute('aria-controls')}"]`)
          const items = target.locator('xpath=../../ul[1]/li')
          await expect(items).toHaveCount(4)

          // Each summary item with the row closed, then with it open.
          for (const start of ['false', 'true'] as const) {
            for (let i = 0; i < 4; i++) {
              if ((await target.getAttribute('aria-expanded')) !== start) {
                await target.locator('.solution-row__title').tap()
                await expect(target).toHaveAttribute('aria-expanded', start)
              }
              await items.nth(i).scrollIntoViewIfNeeded()
              await items.nth(i).tap()
              // A toggle is applied in the tap's event handler; two frames
              // let any re-render land before the states are read.
              await page.evaluate(
                () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
              )
              const expanded = await target.getAttribute('aria-expanded')
              expect(['true', 'false'], `summary item ${i + 1}, row ${start === 'true' ? 'open' : 'closed'}`).toContain(expanded)
              if (expanded === 'true') await expect(panel).toBeVisible()
              else await expect(panel).toBeHidden()
              for (const [other, state] of Object.entries(others)) {
                await expect(buttons.nth(Number(other)), `row ${Number(other) + 1} after summary item ${i + 1}`).toHaveAttribute('aria-expanded', state)
              }
            }
          }
        })
      })
    }

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
            description: text('.process__description'),
            output: text('.process__output'),
            // Words split across lines in the description and output.
            broken: [...item.querySelectorAll('p')].flatMap((p) => {
              const words: string[] = []
              const node = p.firstChild!
              for (const match of p.textContent!.matchAll(/\S+/g)) {
                const range = document.createRange()
                range.setStart(node, match.index)
                range.setEnd(node, match.index + match[0].length)
                const tops = [...range.getClientRects()].filter((r) => r.width > 0).map((r) => r.top)
                if (tops.length > 1 && Math.max(...tops) - Math.min(...tops) > 2) words.push(match[0])
              }
              return words
            }),
            outputSize: parseFloat(getComputedStyle(item.querySelector('.process__output')!).fontSize),
            descriptionSize: parseFloat(getComputedStyle(item.querySelector('.process__description')!).fontSize),
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
          for (const part of [stage.number, stage.name, stage.description, stage.output]) {
            expect(part.left, `text to the node's inline end: ${detail}`).toBeGreaterThanOrEqual(stage.node.right)
          }
          expect(Math.abs(stage.node.y - (stage.number.top + stage.number.bottom) / 2), `node on the number's line: ${detail}`).toBeLessThanOrEqual(1)
        }
      }
      // Number, then name, then description, then the output (#63), each
      // below the last; the output no larger than the description, and no
      // word broken across lines.
      for (const stage of m) {
        expect(stage.name.top).toBeGreaterThanOrEqual(stage.number.bottom - 1)
        expect(stage.description.top).toBeGreaterThanOrEqual(stage.name.bottom - 1)
        expect(stage.output.top).toBeGreaterThanOrEqual(stage.description.bottom - 1)
        expect(stage.outputSize).toBeLessThanOrEqual(stage.descriptionSize)
        expect(stage.broken, detail).toEqual([])
      }
      // Its padding is --space-section-compact, a quarter less than the
      // other light sections' --space-section (#63).
      const padding = await page.evaluate(() => {
        const read = (element: Element) => parseFloat(getComputedStyle(element).paddingTop)
        const bottom = (element: Element) => parseFloat(getComputedStyle(element).paddingBottom)
        const process = document.querySelector('#how-we-work')!
        const about = document.querySelector('#about')!
        return { top: read(process), bottom: bottom(process), section: read(about) }
      })
      expect(padding.top, JSON.stringify(padding)).toBeCloseTo(padding.section * 0.75, 1)
      expect(padding.bottom, JSON.stringify(padding)).toBeCloseTo(padding.section * 0.75, 1)
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

    // Future-ready, About, the closing call to action and the footer
    // (#60): the V2 section padding and display type, the closing
    // actions' layout and target sizes, the dark footer, and no word
    // broken mid-word at default text size.
    test(`future-ready, About, Contact and the footer: padding, type, actions and the dark footer at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const m = await page.evaluate(() => {
        // A token's computed length, read from a probe element.
        const token = (name: string, property: 'paddingTop' | 'fontSize' = 'paddingTop') => {
          const probe = document.createElement('div')
          probe.style[property] = `var(${name})`
          document.body.append(probe)
          const value = parseFloat(getComputedStyle(probe)[property])
          probe.remove()
          return value
        }
        const style = (selector: string) => getComputedStyle(document.querySelector(selector)!)
        const box = (selector: string) => {
          const { left, right, top, bottom, width, height } = document.querySelector(selector)!.getBoundingClientRect()
          return { left, right, top, bottom, width, height }
        }
        const padding = (selector: string) => [parseFloat(style(selector).paddingTop), parseFloat(style(selector).paddingBottom)]
        const type = (selector: string) => ({
          size: parseFloat(style(selector).fontSize),
          weight: style(selector).fontWeight,
          lineHeight: parseFloat(style(selector).lineHeight) / parseFloat(style(selector).fontSize),
        })
        // Words split across two lines, not counting breaks at a hyphen.
        const broken: string[] = []
        for (const selector of ['#future-ready', '#about', '#contact', 'footer']) {
          const walker = document.createTreeWalker(document.querySelector(selector)!, NodeFilter.SHOW_TEXT)
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            for (const match of node.textContent!.matchAll(/[^\s-]+/g)) {
              const range = document.createRange()
              range.setStart(node, match.index)
              range.setEnd(node, match.index + match[0].length)
              const tops = new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)))
              if (tops.size > 1) broken.push(`${selector}: ${match[0]}`)
            }
          }
        }
        const footer = document.querySelector('footer')!
        return {
          section: token('--space-section'),
          dark: token('--space-section-dark'),
          textSection: token('--text-section', 'fontSize'),
          bodyLg: token('--text-body-lg', 'fontSize'),
          futureReady: padding('#future-ready'),
          about: padding('#about'),
          contact: padding('#contact'),
          headings: ['#future-ready-heading', '#about-heading', '#contact-heading'].map(type),
          paragraphs: ['.future-ready__statement', '.about__text', '.contact__text'].map((selector) => parseFloat(style(selector).fontSize)),
          contactLines: box('#contact-heading').height / parseFloat(style('#contact-heading').lineHeight),
          button: box('#contact .button'),
          email: box('.contact__email'),
          phone: box('.contact__phone'),
          footerTargets: [...footer.querySelectorAll('a')].map((link) => {
            const { width, height } = link.getBoundingClientRect()
            return { name: link.textContent, width, height }
          }),
          footer: {
            background: getComputedStyle(footer).backgroundColor,
            border: getComputedStyle(footer).borderTopWidth,
            logo: footer.querySelector('img')!.getAttribute('src'),
            logoWidth: footer.querySelector('img')!.getBoundingClientRect().width,
            grids: footer.querySelectorAll('.technical-grid').length,
          },
          // The footer's items, as laid out (#61): the logo, the nav, the
          // contact links and the copyright, and the row gap.
          footerLayout: {
            items: ['.site-footer__logo', '.site-footer__nav', '.site-footer__contact', '.site-footer__copyright', '.site-footer__sectors'].map(box),
            rowGap: parseFloat(style('.site-footer__inner').rowGap),
            sources: [...document.querySelectorAll('picture > source')].map((source) => getComputedStyle(source).display),
          },
          darkBackground: getComputedStyle(document.querySelector('#future-ready')!).backgroundColor,
          broken,
        }
      })
      const detail = JSON.stringify(m)

      for (const value of m.futureReady) expect(value, `future-ready padding: ${detail}`).toBeCloseTo(m.dark, 1)
      for (const value of [...m.about, ...m.contact]) expect(value, `About and Contact padding: ${detail}`).toBeCloseTo(m.section, 1)
      for (const heading of m.headings) {
        expect(heading.size, detail).toBeCloseTo(m.textSection, 1)
        expect(heading.weight, detail).toBe('300')
        expect(heading.lineHeight, detail).toBeCloseTo(1.05, 2)
      }
      for (const size of m.paragraphs) expect(size, detail).toBeCloseTo(m.bodyLg, 1)
      if (width === 1440) expect(Math.round(m.contactLines), `closing heading lines: ${detail}`).toBeLessThanOrEqual(4)

      // Every closing action and footer link is at least 44 x 44px.
      for (const target of [m.button, m.email, m.phone, ...m.footerTargets]) {
        expect(target.width, detail).toBeGreaterThanOrEqual(44)
        expect(target.height, detail).toBeGreaterThanOrEqual(44)
      }
      expect(m.footerTargets.map((target) => target.name)).toEqual([
        ...FOOTER_NAV,
        'info@fafanua.tech',
        '+256 752 008 822',
        // The "More sectors" line (#73).
        ...footerSolutions.map((solution) => solution.heading),
      ])
      // The button above the address below 768px, beside it from 768px.
      // The phone number follows the address, on its row where both fit.
      const centre = (b: { top: number; bottom: number }) => (b.top + b.bottom) / 2
      if (width < 768) expect(m.email.top, detail).toBeGreaterThanOrEqual(m.button.bottom)
      else {
        expect(Math.abs(centre(m.email) - centre(m.button)), detail).toBeLessThanOrEqual(1)
        expect(m.email.left, detail).toBeGreaterThan(m.button.right)
      }
      if (width >= 360) {
        expect(Math.abs(centre(m.phone) - centre(m.email)), detail).toBeLessThanOrEqual(1)
        expect(m.phone.left, detail).toBeGreaterThan(m.email.right)
      } else {
        expect(m.phone.left > m.email.right || m.phone.top >= m.email.bottom, detail).toBe(true)
      }

      // The dark footer: the future-ready background, no top border, no
      // grid, and the reversed logo at 160px.
      expect(m.footer, detail).toEqual({
        background: m.darkBackground,
        border: '0px',
        logo: '/fafanua-logo-reversed.svg',
        logoWidth: 160,
        grids: 0,
      })
      // The logo picture's <source> takes no box, in the header or the
      // footer (#61).
      expect(m.footerLayout.sources, detail).toEqual(['none', 'none'])
      const [logo, nav, contact, copyright, sectors] = m.footerLayout.items
      if (width >= 1024) {
        // Two rows: the logo at the start with the nav at the end, then
        // the contact links at the start with the copyright at the end.
        expect(nav.left, detail).toBeGreaterThan(logo.right)
        expect(Math.abs(nav.right - copyright.right), detail).toBeLessThanOrEqual(1)
        expect(Math.abs(logo.left - contact.left), detail).toBeLessThanOrEqual(1)
        expect(nav.top, detail).toBeLessThan(contact.top)
        expect(copyright.left, detail).toBeGreaterThan(contact.right)
        expect(contact.top, detail).toBeGreaterThanOrEqual(Math.max(logo.bottom, nav.bottom))
        // Then the "More sectors" line (#73), a row of its own below
        // them, at the start.
        expect(sectors.top, detail).toBeGreaterThanOrEqual(Math.max(contact.bottom, copyright.bottom))
        expect(Math.abs(sectors.left - logo.left), detail).toBeLessThanOrEqual(1)
      } else {
        // Stacked in DOM order, one row gap apart, the logo first and the
        // "More sectors" line (#73) last.
        const items = [logo, nav, contact, copyright, sectors]
        for (let i = 1; i < items.length; i++) {
          expect(items[i].top - items[i - 1].bottom, `gap ${i}: ${detail}`).toBeCloseTo(m.footerLayout.rowGap, 0)
        }
        for (const item of items) expect(Math.abs(item.left - logo.left), detail).toBeLessThanOrEqual(1)
      }
      if (width <= 360) expect(m.broken, detail).toEqual([])
      await expectNoHorizontalScroll(page)
    })

    // The footer's "More sectors" line (#73): quiet, in the footer's small
    // text, the label graphite 400 and the links paper like the footer
    // nav's, underlined on hover only, each at least 24px tall (and 44px,
    // as every footer link), wrapping inside the footer with no
    // horizontal scroll.
    test(`the footer's "More sectors" line is quiet and wraps cleanly at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const footer = page.getByRole('contentinfo')
      await footer.scrollIntoViewIfNeeded()
      const m = await footer.evaluate((root) => {
        const probe = (property: 'color' | 'fontSize', value: string) => {
          const element = document.createElement('span')
          element.style[property] = value
          root.append(element)
          const result = getComputedStyle(element)[property]
          element.remove()
          return result
        }
        const line = root.querySelector('.site-footer__sectors')!
        const label = line.querySelector('.site-footer__sectors-label')!
        const inner = root.querySelector('.site-footer__inner')!.getBoundingClientRect()
        const links = [...line.querySelectorAll('a')]
        const navLink = root.querySelector('.site-footer__nav a')!
        return {
          label: { text: label.textContent, colour: getComputedStyle(label).color, size: getComputedStyle(label).fontSize },
          muted: probe('color', 'var(--color-text-muted)'),
          small: probe('fontSize', 'var(--text-sm)'),
          navColour: getComputedStyle(navLink).color,
          links: links.map((link) => {
            const { left, right, height } = link.getBoundingClientRect()
            return {
              name: link.textContent,
              colour: getComputedStyle(link).color,
              size: getComputedStyle(link).fontSize,
              decoration: getComputedStyle(link).textDecorationLine,
              left,
              right,
              height,
            }
          }),
          inner: { left: inner.left, right: inner.right },
          headings: line.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        }
      })
      const detail = JSON.stringify(m)

      expect(m.label, detail).toEqual({ text: 'More sectors', colour: m.muted, size: m.small })
      expect(m.links.map((link) => link.name)).toEqual(footerSolutions.map((solution) => solution.heading))
      for (const link of m.links) {
        expect(link.colour, detail).toBe(m.navColour)
        expect(link.size, detail).toBe(m.small)
        expect(link.decoration, detail).toBe('none')
        expect(link.height, detail).toBeGreaterThanOrEqual(24)
        expect(link.left, detail).toBeGreaterThanOrEqual(m.inner.left - 1)
        expect(link.right, detail).toBeLessThanOrEqual(m.inner.right + 1)
      }
      expect(m.headings).toBe(0)

      const first = footer.getByRole('link', { name: m.links[0].name!, exact: true })
      await first.hover()
      await expect
        .poll(() => first.evaluate((link) => getComputedStyle(link).textDecorationLine))
        .toBe('underline')
      await expectNoHorizontalScroll(page)
    })

    // The future-ready graphic's final node (#63): labelled "advanced
    // analytics & AI" like the four labels above it, a larger ring than
    // their dots, with the rail reaching it from lineage (#72). About (#63):
    // the heading with the statement beneath it, then the description,
    // side by side from 1024px and stacked below it.
    test(`future-ready destination and the About columns at ${width}px`, async ({ page }, testInfo) => {
      await open(page, testInfo, width)
      const m = await page.evaluate(() => {
        const box = (element: Element) => {
          const { left, right, top, bottom } = element.getBoundingClientRect()
          return { left, right, top, bottom }
        }
        const graphic = document.querySelector('.future-ready__graphic')!
        const items = [...graphic.querySelectorAll('li')]
        const end = graphic.querySelector('.future-ready__end')!
        const ring = getComputedStyle(end, '::before')
        const dot = getComputedStyle(items[0], '::before')
        const rail = getComputedStyle(graphic, '::before')
        const graphicBox = graphic.getBoundingClientRect()
        const endBox = end.getBoundingClientRect()
        const ringTop = endBox.top + parseFloat(ring.top)
        const railBottom = graphicBox.top + parseFloat(rail.top) + parseFloat(rail.height)
        const text = (element: Element) => {
          const s = getComputedStyle(element)
          return `${s.fontSize} ${s.fontWeight} ${s.color}`
        }
        const about = document.querySelector('#about .container')!
        const [heading, statement, description] = ['h2', '.about__statement', '.about__text'].map((selector) => box(about.querySelector(selector)!))
        return {
          endText: end.textContent,
          endStyle: text(end),
          itemStyle: text(items[3]),
          ring: { width: parseFloat(ring.width), border: parseFloat(ring.borderTopWidth), style: ring.borderTopStyle },
          // Border-box sizes (global box-sizing).
          dot: { width: parseFloat(dot.width) },
          railToRing: ringTop - railBottom,
          railStyle: `${rail.borderLeftWidth} ${rail.borderLeftStyle}`,
          endBelowItems: endBox.top >= items[3].getBoundingClientRect().bottom,
          ringBesideLabel: endBox.left + parseFloat(ring.left) + parseFloat(ring.width) <= endBox.left + parseFloat(getComputedStyle(end).paddingLeft),
          about: { heading, statement, description },
          statementStyle: (({ fontSize, fontWeight }) => `${fontSize} ${fontWeight}`)(getComputedStyle(about.querySelector('.about__statement')!)),
          text3xl: (() => {
            const probe = document.createElement('p')
            probe.style.fontSize = 'var(--text-3xl)'
            document.body.append(probe)
            const value = getComputedStyle(probe).fontSize
            probe.remove()
            return value
          })(),
        }
      })
      const detail = JSON.stringify(m)

      expect(m.endText).toBe('advanced analytics & AI')
      expect(m.endStyle, detail).toBe(m.itemStyle)
      expect(m.endBelowItems, detail).toBe(true)
      expect(m.ringBesideLabel, detail).toBe(true)
      // A ring (its border less than half its width), larger than the dots.
      expect(m.ring.style, detail).toBe('solid')
      expect(m.ring.border * 2, detail).toBeLessThan(m.ring.width)
      expect(m.ring.width, detail).toBeGreaterThan(m.dot.width)
      // The rail runs down to the ring's top edge.
      expect(m.railStyle, detail).toBe('1px solid')
      expect(Math.abs(m.railToRing), detail).toBeLessThanOrEqual(1)

      const { heading, statement, description } = m.about
      expect(statement.top, detail).toBeGreaterThanOrEqual(heading.bottom)
      expect(Math.abs(statement.left - heading.left), detail).toBeLessThanOrEqual(1)
      expect(m.statementStyle, detail).toBe(`${m.text3xl} 300`)
      if (width >= 1024) {
        expect(description.left, detail).toBeGreaterThan(Math.max(heading.right, statement.right))
        expect(Math.abs(description.top - heading.top), detail).toBeLessThanOrEqual(1)
      } else {
        expect(description.top, detail).toBeGreaterThanOrEqual(statement.bottom)
        expect(Math.abs(description.left - heading.left), detail).toBeLessThanOrEqual(1)
      }
    })

    if (width === 320) {
      test(`future-ready, About, Contact and the footer fit with 200% page text at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)
        await page.addStyleTag({ content: 'html { font-size: 200%; }' })
        await waitForFonts(page)
        const outside = await page.evaluate(() =>
          ['#future-ready', '#about', '#contact', 'footer'].flatMap((selector) =>
            [...document.querySelector(selector)!.querySelectorAll('*')]
              .filter((element) => {
                const { left, right, width } = element.getBoundingClientRect()
                return width > 0 && (left < 0 || right > window.innerWidth)
              })
              .map((element) => `${selector}: ${element.tagName} ${element.textContent?.slice(0, 30)}`),
          ),
        )
        expect(outside).toEqual([])
        await expectNoHorizontalScroll(page)
      })
    }

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
      ['Book a data trust assessment', '#contact'],
    ] as const) {
      test(`hero "${name}" lands on ${hash} at ${width}px`, async ({ page }, testInfo) => {
        await open(page, testInfo, width)

        await heroRegion(page).getByRole('link', { name, exact: true }).click()

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
