import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, type TestInfo } from '@playwright/test'
import { AXE_TAGS, formatViolations } from '../src/test/axe.ts'

export const HEIGHT = 800

/** Opens the page at a width and waits until the web font has loaded. */
export async function openPage(page: Page, width: number, height = HEIGHT) {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await waitForFonts(page)
}

export async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
  })
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
