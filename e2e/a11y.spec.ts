import { expect, test, type Page } from '@playwright/test'
import { expectNoAxeViolations, openPage } from './fixtures.ts'

// Axe on the production preview in a real browser, where contrast,
// target size and reflow can be measured. Each state is its own test, so
// a failure names the state and width that broke.

test.describe('axe, page as loaded', () => {
  for (const width of [320, 360, 768, 1024, 1440]) {
    test(`everything closed at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

test.describe('axe, mobile menu open', () => {
  for (const width of [320, 360]) {
    test(`menu opened with the keyboard at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      const toggle = page.getByRole('button', { name: 'Menu' })
      await toggle.focus()
      await page.keyboard.press('Enter')
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

test.describe('axe, all Typical work disclosures open', () => {
  for (const width of [320, 1440]) {
    test(`six disclosures open at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      const buttons = page.getByRole('button', { name: /^Typical work for / })
      await expect(buttons).toHaveCount(6)
      for (const button of await buttons.all()) {
        await button.click()
        await expect(button).toHaveAttribute('aria-expanded', 'true')
      }

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

test.describe('axe, skip link focused', () => {
  for (const width of [360, 1440]) {
    test(`skip link visible after the first Tab at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      await page.keyboard.press('Tab')
      const skip = page.getByRole('link', { name: 'Skip to content' })
      await expect(skip).toBeFocused()
      await expect(skip).toBeInViewport()

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

test.describe('axe, 200% browser zoom', () => {
  // A 1280px window at 200% zoom: a 640 x 400 CSS-pixel viewport drawn at
  // twice the device pixel ratio.
  test.use({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 })

  test('1280px window at 200% zoom (640px)', async ({ page }, testInfo) => {
    await openPage(page, 640, 400)

    await expectNoAxeViolations(page, testInfo)
  })
})

test.describe('reduced motion', () => {
  const durations = (page: Page) =>
    page.evaluate(() => {
      // The longest duration in milliseconds, rounded so that 1e-05s
      // reads as exactly 0.01.
      const ms = (value: string) =>
        Math.max(
          ...value.split(',').map((part) => {
            const n = parseFloat(part)
            const value = part.trim().endsWith('ms') ? n : n * 1000
            return Math.round(value * 1e6) / 1e6
          }),
        )
      const button = document.querySelector('.button')
      const chevron = document.querySelector('.service-card__chevron')
      if (!button || !chevron) throw new Error('No .button or chevron found')
      return {
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
        button: ms(getComputedStyle(button).transitionDuration),
        chevron: ms(getComputedStyle(chevron).transitionDuration),
      }
    })

  test('reduce: no smooth scrolling and near-zero transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openPage(page, 1440)
    const result = await durations(page)

    expect(result.scroll).toBe('auto')
    expect(result.button).toBeLessThanOrEqual(0.01)
    expect(result.chevron).toBeLessThanOrEqual(0.01)
  })

  test('no-preference: smooth scrolling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openPage(page, 1440)

    expect((await durations(page)).scroll).toBe('smooth')
  })
})

test.describe('320px at 200% text size', () => {
  // The default font size doubled, as with Chrome's font size setting at
  // 32px. The header's logo used to overflow the page by 32px here.
  const noHorizontalScroll = async (page: Page) => {
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    expect(scrollWidth, `scrollWidth ${scrollWidth}, innerWidth ${innerWidth}`)
      .toBeLessThanOrEqual(innerWidth)
  }

  test.beforeEach(async ({ page }) => {
    await openPage(page, 320)
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await expect
      .poll(() =>
        page.evaluate(() => getComputedStyle(document.documentElement).fontSize),
      )
      .toBe('32px')
  })

  test('no horizontal scroll with the menu closed', async ({ page }) => {
    await noHorizontalScroll(page)
  })

  test('no horizontal scroll with the menu open', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Menu' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await noHorizontalScroll(page)
  })

  test('no horizontal scroll with all disclosures open', async ({ page }) => {
    for (const button of await page
      .getByRole('button', { name: /^Typical work for / })
      .all()) {
      await button.click()
      await expect(button).toHaveAttribute('aria-expanded', 'true')
    }

    await noHorizontalScroll(page)
  })

  test('skip link focused, no horizontal scroll', async ({ page }) => {
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()

    await noHorizontalScroll(page)
  })
})
