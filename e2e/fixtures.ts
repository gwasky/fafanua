import AxeBuilder from '@axe-core/playwright'
import {
  test as base,
  expect,
  type Page,
  type TestInfo,
} from '@playwright/test'
import { AXE_TAGS, formatViolations } from '../src/test/axe.ts'

export const HEIGHT = 800

/** The widths the responsive projects in playwright.config.ts run at. */
export const WIDTHS = [320, 360, 768, 1024, 1440] as const

/**
 * The Playwright test, with an automatic fixture that fails the test,
 * after it has run, if the page logged a console error or threw an
 * uncaught exception. There is no allowlist: an entry would need a code
 * comment and the issue that tracks it.
 */
export const test = base.extend<{ consoleErrors: void }>({
  consoleErrors: [
    async ({ page }, run) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() !== 'error') return
        const { url, lineNumber, columnNumber } = message.location()
        errors.push(
          `console.error: ${message.text()}\n  at ${url}:${lineNumber}:${columnNumber}`,
        )
      })
      page.on('pageerror', (error) => {
        errors.push(`pageerror: ${error.message}\n  at ${error.stack ?? page.url()}`)
      })

      await run()

      expect(errors, `console errors on the page:\n${errors.join('\n')}`).toEqual([])
    },
    { auto: true },
  ],
})

/** Opens the page at a width and waits until the web font has loaded. */
export async function openPage(page: Page, width: number, height = HEIGHT) {
  await openPath(page, '/', width, height)
}

/**
 * Opens a path, which may carry a query and a hash, at a width and waits
 * until the web font has loaded.
 */
export async function openPath(page: Page, path: string, width: number, height = HEIGHT) {
  await page.setViewportSize({ width, height })
  await page.goto(path)
  await waitForFonts(page)
  await waitForMotion(page)
}

/**
 * Waits until no CSS animation or transition is running on the page: the
 * hero reveal on load, and any section reveal or rail line under way
 * (#61), so boxes and colours are measured in their final state. Under
 * reduced motion, where nothing runs, it returns after two frames.
 */
export async function waitForMotion(page: Page) {
  await page.evaluate(async () => {
    // Two frames first, each time: the reveal observer reports, and a
    // transition starts, a frame after a scroll, so checking at once could
    // miss a reveal that is about to begin.
    const frames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    for (;;) {
      await frames()
      const running = document
        .getAnimations()
        .filter((animation) => animation.playState === 'running' || animation.pending)
      if (running.length === 0) return
      await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)))
    }
  })
}

/**
 * Scrolls the page from the top to the bottom one viewport at a time,
 * instantly, giving the reveal observer two frames at each step, so every
 * section and the lifecycle rail reveals (#61). Then waits for the
 * reveals to finish and returns to where the page was.
 */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const start = window.scrollY
    const step = Math.max(1, Math.floor(window.innerHeight / 2))
    for (let y = 0; ; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await frame()
      if (y >= document.documentElement.scrollHeight - window.innerHeight) break
    }
    window.scrollTo({ top: start, behavior: 'instant' })
    await frame()
  })
  await waitForMotion(page)
}

/**
 * Waits until the "Inter Variable" face (style normal) has status
 * "loaded", so layout is measured in the web font. document.fonts.ready
 * alone is not enough: it can resolve before the font starts loading,
 * and the layout would then be measured in the fallback font.
 */
export async function waitForFonts(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          await document.fonts.ready
          return [...document.fonts]
            .filter(
              (face) =>
                face.family.replace(/^["']|["']$/g, '') === 'Inter Variable' &&
                face.style === 'normal',
            )
            .map((face) => face.status)
        }),
      { message: '"Inter Variable" normal FontFace statuses' },
    )
    .toContain('loaded')
}

/**
 * Runs axe on the whole page, with the same rule tags as the Vitest
 * helper and every rule enabled, color-contrast included. Fails listing
 * each violation's rule id, targets and help text. Incomplete results are
 * printed and attached to the report, but do not fail the test.
 */
export async function expectNoAxeViolations(page: Page, testInfo: TestInfo) {
  await waitForFonts(page)
  // Partly faded text would give contrast results for a midway colour.
  await waitForMotion(page)
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()

  if (results.incomplete.length > 0) {
    const incomplete = results.incomplete
      .map(
        (result) =>
          `- ${result.id}: ${result.help}\n  targets: ${result.nodes
            .map((node) => node.target.join(' '))
            .join(', ')}`,
      )
      .join('\n')
    console.log(`axe incomplete in "${testInfo.title}":\n${incomplete}`)
    await testInfo.attach('axe-incomplete.json', {
      body: JSON.stringify(results.incomplete, null, 2),
      contentType: 'application/json',
    })
  }

  expect(
    results.violations,
    `axe violations in "${testInfo.title}":\n${formatViolations(results.violations)}`,
  ).toEqual([])
}

/**
 * The role and accessible name of the focused element, read from its
 * ARIA snapshot (for example `link "Services"`), or "body" when nothing
 * on the page has focus.
 */
export async function focusedName(page: Page) {
  const tag = await page.evaluate(() => document.activeElement?.tagName)
  if (tag === undefined || tag === 'BODY') return 'body'
  const snapshot = await page.locator(':focus').ariaSnapshot()
  const match = /^- \w+ "([^"]*)"/.exec(snapshot)
  return match ? match[1] : snapshot
}

/**
 * Presses the key that moves focus to the next stop: Alt+Tab (Option+Tab)
 * in WebKit and Tab in every other engine. Measured in Playwright's WebKit
 * 2359 (#45): plain Tab leaves focus on body from every starting point,
 * even when the next stop is a button, while Alt+Tab reaches the same stop
 * as Chromium's Tab. In macOS Safari with default settings, Option+Tab is
 * the key that reaches every link.
 *
 * With `{ shift: true }` it moves to the previous stop instead:
 * Alt+Shift+Tab in WebKit and Shift+Tab elsewhere. Measured in the same
 * WebKit for #46, at 1440 and 360 with reduced motion: plain Tab from the
 * focused logo link goes to body, at 1440 (next stop: the Services link)
 * and at 360, where the next stop is the Menu button. Shift+Tab from the
 * focused Menu button also goes to body. Alt+Shift+Tab reaches the same
 * stops as Chromium's Shift+Tab, in the same order.
 */
export async function pressTab(page: Page, { shift = false }: { shift?: boolean } = {}) {
  const engine = page.context().browser()?.browserType().name()
  const key = shift ? 'Shift+Tab' : 'Tab'
  await page.keyboard.press(engine === 'webkit' ? `Alt+${key}` : key)
}

/** The focused element's :focus-visible state and computed outline. */
export async function focusStyle(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement
    if (!element || element === document.body) return null
    const style = getComputedStyle(element)
    return {
      focusVisible: element.matches(':focus-visible'),
      outline: `${style.outlineWidth} ${style.outlineStyle}`,
      offset: style.outlineOffset,
    }
  })
}

/**
 * Waits until scrolling has settled: window.scrollY stays the same across
 * three consecutive animation frames. It also returns when nothing
 * scrolls, which the scrollend event would not report.
 */
export async function waitForScrollSettle(page: Page) {
  await page.evaluate(() => {
    delete (window as { __settle?: unknown }).__settle
  })
  await page.waitForFunction(
    () => {
      const w = window as { __settle?: { y: number; frames: number } }
      const state = w.__settle
      if (!state || state.y !== window.scrollY) {
        w.__settle = { y: window.scrollY, frames: 0 }
        return false
      }
      state.frames += 1
      return state.frames >= 3
    },
    undefined,
    { polling: 'raf' },
  )
}

/**
 * Waits for a fresh load with a hash to finish landing, without scrolling:
 * the web font has loaded, and window.scrollY and the target's top have
 * stayed the same for 10 animation frames in a row. landOnHash corrects
 * the landing once, after the fonts have loaded and the target has been
 * still for 4 frames (#62), so a shorter wait could measure the page
 * before that correction.
 */
export async function waitForLanding(page: Page, hash: string) {
  await waitForFonts(page)
  await page.waitForFunction(
    (id) => {
      const w = window as { __landing?: { key: string; frames: number } }
      const target = document.getElementById(id)
      const key = `${window.scrollY} ${target?.getBoundingClientRect().top}`
      if (!w.__landing || w.__landing.key !== key) {
        w.__landing = { key, frames: 0 }
        return false
      }
      w.__landing.frames += 1
      return w.__landing.frames >= 10
    },
    hash.slice(1),
    { polling: 'raf' },
  )
}

/**
 * Asserts that an in-page link has landed, once scrolling has settled.
 * For #top the page is at the very top. So it is for #main: its first
 * child, the dark hero, is pulled up under the header (#55), so main
 * starts at the page's top, and landing on it leaves the page at scroll 0
 * with the header transparent over the hero. For a section, its top edge is
 * within 1px of the sticky header's bottom edge, so the header hides none
 * of it, or, when the page cannot scroll that far, the page is at its
 * bottom limit and the section is in the viewport below the header.
 */
export async function expectLanded(page: Page, hash: string) {
  await waitForScrollSettle(page)
  const metrics = await page.evaluate((id) => {
    const element = document.getElementById(id)
    if (!element) throw new Error(`No element with id "${id}"`)
    const header = document.querySelector('header')
    if (!header) throw new Error('No header')
    return {
      top: element.getBoundingClientRect().top,
      // A static header (short viewports) may have scrolled away.
      headerBottom: Math.max(0, header.getBoundingClientRect().bottom),
      scrollY: window.scrollY,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    }
  }, hash.slice(1))
  const detail = `${hash}: ${JSON.stringify(metrics)}`

  if (hash === '#top') {
    expect(metrics.scrollY, detail).toBe(0)
  } else if (hash === '#main') {
    expect(metrics.scrollY, detail).toBe(0)
    expect(metrics.top, detail).toBe(0)
  } else if (Math.abs(metrics.top - metrics.headerBottom) <= 1) {
    expect(Math.abs(metrics.top - metrics.headerBottom), detail).toBeLessThanOrEqual(1)
  } else {
    expect(Math.abs(metrics.scrollY - metrics.maxScroll), detail).toBeLessThanOrEqual(1)
    expect(metrics.top, detail).toBeGreaterThan(metrics.headerBottom)
    await expect(page.locator(`[id="${hash.slice(1)}"]`)).toBeInViewport()
  }
}

/**
 * The focused element's box and the header's, in viewport coordinates,
 * with whether the focused element is inside the header.
 */
export function focusAndHeaderBoxes(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement
    const header = document.querySelector('header')
    if (!element || !header) throw new Error('No focused element or header')
    const box = (target: Element) => {
      const { top, bottom, left, right } = target.getBoundingClientRect()
      return { top, bottom, left, right }
    }
    // How far the focus ring reaches outside the box: outline width plus
    // offset, when there is an outline.
    const style = getComputedStyle(element)
    const ring =
      style.outlineStyle === 'none'
        ? 0
        : parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
    return {
      inHeader: header.contains(element),
      focused: box(element),
      ring,
      header: box(header),
      viewport: { width: window.innerWidth, height: window.innerHeight },
    }
  })
}

// With includeHidden, Playwright counts aria-hidden content in the name,
// so the call to action's is "Discuss a project →" there; everywhere
// else it is "Discuss a project". This matches the label exactly, with
// or without the arrow.
export const linkName = (label: string) =>
  new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: →)?$`)
