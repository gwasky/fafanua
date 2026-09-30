import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expectNoAxeViolations, openPage } from './fixtures.ts'
import { formatViolations } from '../src/test/axe.ts'

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

test.describe('axe, all Typical engagements disclosures open', () => {
  for (const width of [320, 1440]) {
    test(`six disclosures open at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      const buttons = page.getByRole('button', { name: /^Typical engagements for / })
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
  // The longest duration in milliseconds, rounded so that 1e-05s reads as
  // exactly 0.01.
  const ms = (value: string) =>
    Math.max(
      ...value.split(',').map((part) => {
        const n = parseFloat(part)
        const value = part.trim().endsWith('ms') ? n : n * 1000
        return Math.round(value * 1e6) / 1e6
      }),
    )

  const durations = (page: Page) =>
    page.evaluate(() => {
      const chevron = document.querySelector('.service-card__chevron')
      if (!chevron) throw new Error('No chevron found')
      return {
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
        chevron: getComputedStyle(chevron).transitionDuration,
      }
    })

  // The hero's two calls to action, one of each button style, both
  // visible at 1440px.
  const buttonDurations = async (page: Page) => {
    const links = {
      'Contact our team': page.getByRole('link', { name: 'Contact our team' }),
      'See our services': page.getByRole('link', { name: 'See our services' }),
    }
    const results: { name: string; duration: number }[] = []
    for (const [name, link] of Object.entries(links)) {
      await expect(link).toBeVisible()
      const duration = await link.evaluate(
        (element) => getComputedStyle(element).transitionDuration,
      )
      results.push({ name, duration: ms(duration) })
    }
    return results
  }

  test('reduce: no smooth scrolling and near-zero transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openPage(page, 1440)
    const buttons = await buttonDurations(page)
    const result = await durations(page)

    expect(result.scroll).toBe('auto')
    for (const { name, duration } of buttons) {
      expect.soft(duration, `longest transition-duration of "${name}"`)
        .toBeLessThanOrEqual(0.01)
    }
    expect(ms(result.chevron)).toBeLessThanOrEqual(0.01)
  })

  test('no-preference: smooth scrolling and 150ms button transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openPage(page, 1440)
    const buttons = await buttonDurations(page)

    expect((await durations(page)).scroll).toBe('smooth')
    for (const { name, duration } of buttons) {
      expect.soft(duration, `longest transition-duration of "${name}"`).toBe(150)
    }
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
      .getByRole('button', { name: /^Typical engagements for / })
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

test.describe('skip link overlays the header without moving it (#7)', () => {
  const layout = (page: Page) =>
    page.evaluate(() => {
      const box = (selector: string) => {
        const element = document.querySelector(selector)
        if (!element) throw new Error(`No ${selector}`)
        const { x, y, width, height } = element.getBoundingClientRect()
        return { x, y, width, height }
      }
      return {
        header: box('header'),
        logo: box('.site-header__logo'),
        main: box('main'),
        scrollY: window.scrollY,
      }
    })

  const cases = [
    { width: 320, text: '100%' },
    { width: 360, text: '100%' },
    { width: 768, text: '100%' },
    { width: 1440, text: '100%' },
    { width: 320, text: '200%' },
  ]

  for (const { width, text } of cases) {
    test(`logo link and main stay put, and the logo keeps a 24px target, at ${width}px with ${text} text`, async ({ page }) => {
      await openPage(page, width)
      if (text !== '100%') {
        await page.addStyleTag({ content: `html { font-size: ${text}; }` })
        await expect
          .poll(() =>
            page.evaluate(() => getComputedStyle(document.documentElement).fontSize),
          )
          .toBe('32px')
      }
      const before = await layout(page)

      await page.keyboard.press('Tab')
      const skip = page.getByRole('link', { name: 'Skip to content' })
      await expect(skip).toBeFocused()
      await expect(skip).toBeInViewport({ ratio: 1 })

      expect(await layout(page)).toEqual(before)

      // WCAG 2.5.8: the part of the logo link the skip link leaves
      // uncovered must still hold a 24 x 24px target. The skip link sits
      // over the logo's top-left corner, so the largest free rectangle is
      // the band below it or the strip to its right.
      const skipBox = await skip.boundingBox()
      const logo = before.logo
      if (!skipBox) throw new Error('Skip link has no box')
      const below = logo.y + logo.height - Math.max(logo.y, skipBox.y + skipBox.height)
      const right = logo.x + logo.width - Math.max(logo.x, skipBox.x + skipBox.width)
      const free = Math.max(
        Math.min(logo.width, below),
        Math.min(logo.height, right),
      )
      expect(free, `largest uncovered side of the logo link`).toBeGreaterThanOrEqual(24)

      // And axe's own measure, at every width here, not only the two in
      // the full scans above.
      const { violations } = await new AxeBuilder({ page })
        .withRules(['target-size'])
        .analyze()
      expect(violations, formatViolations(violations)).toEqual([])
    })
  }
})
