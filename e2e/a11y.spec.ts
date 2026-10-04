import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expectLanded, expectNoAxeViolations, openPage } from './fixtures.ts'
import { SEQUENCE, walkFocus } from './focus.ts'
import { formatViolations } from '../src/test/axe.ts'
import { servicesIntro } from '../src/data/services.ts'

// Axe on the production preview in a real browser, where contrast,
// target size and reflow can be measured. Each state is its own test, so
// a failure names the state and width that broke.

test.describe('axe, page as loaded', () => {
  for (const width of [320, 360, 768, 1024, 1440]) {
    test(`everything closed at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      // At the top: the header is transparent over the dark hero.
      await expect(page.getByRole('banner')).toHaveClass(/\bon-dark\b/)

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

test.describe('axe, page scrolled', () => {
  // The header is solid once the page has scrolled 8px or more; at the
  // top it is transparent over the dark hero (checked as loaded, above).
  for (const width of [360, 1440]) {
    test(`header solid after scrolling at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      await page.evaluate(() => window.scrollTo(0, 600))
      await expect(page.getByRole('banner')).not.toHaveClass(/\bon-dark\b/)

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

test.describe('axe, a service card hovered', () => {
  for (const width of [768, 1440]) {
    test(`second card hovered at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      const card = page
        .getByRole('region', { name: servicesIntro.heading })
        .getByRole('listitem')
        .filter({ has: page.getByRole('heading', { level: 3 }) })
        .nth(1)
      await card.hover()
      await expect
        .poll(() => card.evaluate((item) => getComputedStyle(item.firstElementChild!).boxShadow))
        .toContain('8px')

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

  // Below 480px of height the header scrolls away with the page instead
  // of taking a large share of the screen (WCAG 1.4.10), and sections land
  // at the top of the viewport.
  test('the header is static and scrolls away at 640 x 400', async ({ page }) => {
    await openPage(page, 640, 400)
    const header = page.getByRole('banner')
    expect(await header.evaluate((element) => getComputedStyle(element).position)).toBe('relative')

    await page.getByRole('link', { name: 'Explore our capabilities' }).click()
    await expect(page).toHaveURL(/#services$/)
    await expectLanded(page, '#services')
    const { headerBottom, top } = await page.evaluate(() => ({
      headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
      top: document.getElementById('services')!.getBoundingClientRect().top,
    }))
    expect(headerBottom).toBeLessThanOrEqual(0)
    expect(Math.abs(top)).toBeLessThanOrEqual(1)
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
      'Discuss your data needs': page.getByRole('link', { name: 'Discuss your data needs' }),
      'Explore our capabilities': page.getByRole('link', { name: 'Explore our capabilities' }),
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

  // The header's call to action and its arrow, and the header itself.
  const cta = (page: Page) =>
    page.getByRole('banner').getByRole('link', { name: 'Discuss a project' })

  const arrowAndHeader = (page: Page) =>
    page.evaluate(() => {
      const arrow = document.querySelector('header .button__arrow')
      const header = document.querySelector('header')
      if (!arrow || !header) throw new Error('No arrow or header')
      const style = getComputedStyle(arrow)
      return {
        arrowTranslate: style.translate,
        arrowDuration: style.transitionDuration,
        headerProperty: getComputedStyle(header).transitionProperty,
        headerDuration: getComputedStyle(header).transitionDuration,
      }
    })

  // A token resolved to its computed time, as a transition-duration.
  const tokenDuration = (page: Page, name: string) =>
    page.evaluate((token) => {
      const probe = document.createElement('div')
      probe.style.transitionDuration = `var(${token})`
      document.body.append(probe)
      const value = getComputedStyle(probe).transitionDuration
      probe.remove()
      return value
    }, name)

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

    // The header has no transition, and the arrow stays still on hover
    // and on keyboard focus.
    const still = await arrowAndHeader(page)
    expect(ms(still.headerDuration), 'header transition').toBeLessThanOrEqual(0.01)
    expect(still.arrowTranslate).toBe('none')
    await cta(page).hover()
    expect((await arrowAndHeader(page)).arrowTranslate, 'arrow on hover').toBe('none')
    await page.mouse.move(0, 799)
    await page.getByRole('banner').getByRole('link', { name: 'About', exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(cta(page)).toBeFocused()
    expect(await cta(page).evaluate((element) => element.matches(':focus-visible'))).toBe(true)
    expect((await arrowAndHeader(page)).arrowTranslate, 'arrow on focus').toBe('none')
  })

  test('no-preference: smooth scrolling and 150ms button transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openPage(page, 1440)
    const buttons = await buttonDurations(page)

    expect((await durations(page)).scroll).toBe('smooth')
    for (const { name, duration } of buttons) {
      expect.soft(duration, `longest transition-duration of "${name}"`).toBe(150)
    }

    // The header animates only its background and border colours, over
    // --duration-header; the arrow moves --cta-arrow-shift (4px) over
    // --duration-cta-arrow on hover and on keyboard focus.
    const moving = await arrowAndHeader(page)
    expect(moving.headerProperty).toBe('background-color, border-color')
    expect(moving.headerDuration).toBe(await tokenDuration(page, '--duration-header'))
    expect(moving.arrowDuration).toBe(await tokenDuration(page, '--duration-cta-arrow'))
    expect(moving.arrowTranslate).toBe('none')

    await cta(page).hover()
    await expect.poll(async () => (await arrowAndHeader(page)).arrowTranslate).toBe('4px')
    await page.mouse.move(0, 799)
    await expect.poll(async () => (await arrowAndHeader(page)).arrowTranslate).toBe('none')
    await page.getByRole('banner').getByRole('link', { name: 'About', exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(cta(page)).toBeFocused()
    await expect.poll(async () => (await arrowAndHeader(page)).arrowTranslate).toBe('4px')
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

test.describe('a header taller than a quarter of the viewport is static', () => {
  // At 320 x 800 with 200% text the header wraps to two rows, 257px, so
  // it scrolls away rather than covering a third of the screen, and
  // sections land at the top of the viewport. At the default size it
  // sticks.
  const position = (page: Page) =>
    page.getByRole('banner').evaluate((element) => getComputedStyle(element).position)

  test('sticks at 320px with 100% text, and is static with 200% text', async ({ page }) => {
    await openPage(page, 320)
    expect(await position(page)).toBe('sticky')

    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await expect.poll(() => position(page)).toBe('relative')
    const { height, viewport } = await page.evaluate(() => ({
      height: document.querySelector('header')!.getBoundingClientRect().height,
      viewport: window.innerHeight,
    }))
    expect(height).toBeGreaterThan(0.25 * viewport)

    await page.getByRole('link', { name: 'Explore our capabilities' }).click()
    await expect(page).toHaveURL(/#services$/)
    await expectLanded(page, '#services')
    const { headerBottom, top } = await page.evaluate(() => ({
      headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
      top: document.getElementById('services')!.getBoundingClientRect().top,
    }))
    expect(headerBottom).toBeLessThanOrEqual(0)
    expect(Math.abs(top)).toBeLessThanOrEqual(1)
  })

  test('sticks again when the viewport grows tall enough', async ({ page }) => {
    await openPage(page, 320)
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await expect.poll(() => position(page)).toBe('relative')

    // 257px is under a quarter of 1100px.
    await page.setViewportSize({ width: 320, height: 1100 })
    await expect.poll(() => position(page)).toBe('sticky')
  })
})

test.describe('browser text size 200%: the header falls back to the Menu', () => {
  // The inline-nav breakpoint is 64em, and em in a media query follows the
  // browser's default text size, not the page's CSS. Chromium's font size
  // setting is set here through CDP (Page.setFontSizes), so this runs in
  // the chromium project only; WebKit has no equivalent in Playwright.
  // At 32px the breakpoint is 2048px, so a 1024px window shows the Menu
  // instead of wrapping the inline row (it measured about 819px tall).
  test.beforeEach(async ({ page }) => {
    const session = await page.context().newCDPSession(page)
    await session.send('Page.enable')
    await session.send('Page.setFontSizes', { fontSizes: { standard: 32 } })
  })

  const header = (page: Page) =>
    page.getByRole('banner').evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      position: getComputedStyle(element).position,
      rootFontSize: getComputedStyle(document.documentElement).fontSize,
      viewport: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
  const toggle = (page: Page) => page.getByRole('button', { name: 'Menu' })
  const inlineLink = (page: Page) =>
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Services' })

  test('shows the Menu at 1024px, on one sticky row, and the menu works', async ({ page }) => {
    await openPage(page, 1024)
    const state = await header(page)
    const detail = JSON.stringify(state)

    expect(state.rootFontSize).toBe('32px')
    await expect(toggle(page)).toBeVisible()
    await expect(inlineLink(page)).toBeHidden()
    // The logo and the Menu on one row: 96px logo link plus 32px padding
    // above and below and the border, a fifth of the 800px viewport.
    expect(state.height, detail).toBe(161)
    expect(state.height, detail).toBeLessThanOrEqual(0.25 * state.viewport)
    expect(state.position, detail).toBe('sticky')
    expect(state.scrollWidth, detail).toBeLessThanOrEqual(state.innerWidth)

    await toggle(page).click()
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true')
    for (const name of ['Services', 'Solutions', 'How We Work', 'About', 'Discuss a project']) {
      await expect(
        page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true }),
      ).toBeVisible()
    }
  })

  // Every Tab and Shift+Tab stop is wholly visible below the sticky
  // header. The content breakpoints are in em too, so at 1024px with 32px
  // text the service cards are one column and their disclosure buttons
  // stay short (in three columns they were about 658px tall).
  test('Tab and Shift+Tab keep every stop wholly visible at 1024 x 800', async ({ page }) => {
    await openPage(page, 1024)
    expect((await header(page)).position).toBe('sticky')
    // The section's first list is the lifecycle rail, the second the
    // service cards.
    const lists = page.getByRole('region', { name: servicesIntro.heading }).getByRole('list')
    const lefts = (index: number) =>
      lists
        .nth(index)
        .locator(':scope > li')
        .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().left)))
    expect(new Set(await lefts(1)).size, 'service card columns').toBe(1)
    // The rail is vertical: one left edge, each stage below the last.
    const rail = await lefts(0)
    expect(rail, 'rail stages').toHaveLength(6)
    expect(new Set(rail).size, 'rail columns').toBe(1)

    await walkFocus(page, SEQUENCE.menu)
  })

  test('switches at 64em: Menu at 2047px, inline nav on one row at 2048px', async ({ page }) => {
    await openPage(page, 2047)
    await expect(toggle(page)).toBeVisible()
    await expect(inlineLink(page)).toBeHidden()

    await openPage(page, 2048)
    await expect(toggle(page)).toBeHidden()
    await expect(inlineLink(page)).toBeVisible()
    expect((await header(page)).height).toBe(161)
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
