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
 */
export async function pressTab(page: Page) {
  const engine = page.context().browser()?.browserType().name()
  await page.keyboard.press(engine === 'webkit' ? 'Alt+Tab' : 'Tab')
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
 * Asserts that an in-page link has landed, once scrolling has settled.
 * For #top the page is at the very top. For a section, its top edge is
 * within 1px of the viewport top or, when the page cannot scroll that far,
 * the page is at its bottom limit and the section is in the viewport.
 */
export async function expectLanded(page: Page, hash: string) {
  await waitForScrollSettle(page)
  const metrics = await page.evaluate((id) => {
    const element = document.getElementById(id)
    if (!element) throw new Error(`No element with id "${id}"`)
    return {
      top: element.getBoundingClientRect().top,
      scrollY: window.scrollY,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    }
  }, hash.slice(1))
  const detail = `${hash}: ${JSON.stringify(metrics)}`

  if (hash === '#top') {
    expect(metrics.scrollY, detail).toBe(0)
  } else if (Math.abs(metrics.top) <= 1) {
    expect(Math.abs(metrics.top), detail).toBeLessThanOrEqual(1)
  } else {
    expect(Math.abs(metrics.scrollY - metrics.maxScroll), detail).toBeLessThanOrEqual(1)
    await expect(page.locator(`[id="${hash.slice(1)}"]`)).toBeInViewport()
  }
}
