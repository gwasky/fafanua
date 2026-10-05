import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expectLanded, expectNoAxeViolations, openPage, scrollThrough, waitForMotion } from './fixtures.ts'
import { SEQUENCE, walkFocus } from './focus.ts'
import { AXE_TAGS, formatViolations } from '../src/test/axe.ts'
import { managedServices, servicesIntro } from '../src/data/services.ts'

// Axe on the production preview in a real browser, where contrast,
// target size and reflow can be measured. Each state is its own test, so
// a failure names the state and width that broke.

/** Opens all five Solutions rows (#59) with the keyboard. */
async function openAllSectors(page: Page) {
  const buttons = page.getByRole('region', { name: 'Solutions' }).getByRole('button')
  await expect(buttons).toHaveCount(5)
  for (const button of await buttons.all()) {
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-expanded', 'true')
  }
}

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

// The section reveals (#61): with motion allowed, axe runs once every
// section has revealed, so no partly faded text is measured; under
// reduced motion nothing is ever hidden or faded.
test.describe('axe, motion settings', () => {
  for (const width of [360, 1440]) {
    test(`no-preference, scrolled through to the bottom and back, at ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await openPage(page, width)
      await scrollThrough(page)
      expect(await page.locator('[data-reveal-state="hidden"]').count()).toBe(0)

      await expectNoAxeViolations(page, testInfo)
    })

    test(`reduce, as loaded and scrolled through, at ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await openPage(page, width)
      expect(await page.locator('[data-reveal-state]').count()).toBe(0)
      await expectNoAxeViolations(page, testInfo)

      await scrollThrough(page)
      expect(await page.locator('[data-reveal-state]').count()).toBe(0)
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

test.describe('axe, all five Solutions rows open', () => {
  for (const width of [320, 768, 1440]) {
    test(`five rows open at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      await openAllSectors(page)

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

test.describe('axe, Managed Services panel in view', () => {
  // The dark panel (#58) scrolled into view under the solid header.
  const showPanel = async (page: Page) => {
    const panel = page
      .getByRole('region', { name: managedServices.sectionHeading })
      .locator('.surface-dark')
    await panel.scrollIntoViewIfNeeded()
    await expect(panel).toBeInViewport()
    await expect(page.getByRole('banner')).not.toHaveClass(/\bon-dark\b/)
    return panel
  }

  for (const width of [360, 1024, 1440]) {
    test(`panel in view at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      await showPanel(page)

      await expectNoAxeViolations(page, testInfo)
    })

    // Forced colours: every rule but color-contrast. In Chromium's
    // emulation the forced text colour is in `color` but
    // -webkit-text-fill-color keeps the authored one, which axe reads, and
    // axe then pairs it with the forced background: measured in #58 it
    // reports graphite 300 on white for the panel's text, and
    // the solid header's call to action fails the same way, while the page
    // paints black on white (`color` rgb(0, 0, 0) on rgb(255, 255, 255),
    // checked here and in the screenshot). So the painted contrast is
    // checked directly instead. The owner accepted this substitution on
    // #58 (2026-10-05): only color-contrast is off, only in this run, and
    // the normal-colour runs above keep every rule.
    test(`panel in view, forced colours, at ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ forcedColors: 'active' })
      await openPage(page, width)
      const panel = await showPanel(page)

      const results = await new AxeBuilder({ page })
        .withTags(AXE_TAGS)
        .disableRules(['color-contrast'])
        .analyze()
      expect(
        results.violations,
        `axe violations in "${testInfo.title}":\n${formatViolations(results.violations)}`,
      ).toEqual([])

      const painted = await panel.evaluate((root) => {
        const background = getComputedStyle(root).backgroundColor
        return [...root.querySelectorAll('p, h2, h3, li')].map((element) => ({
          text: element.textContent?.slice(0, 30),
          colour: getComputedStyle(element).color,
          background,
        }))
      })
      for (const { text, colour, background } of painted) {
        expect({ text, colour, background }).toEqual({
          text,
          colour: 'rgb(0, 0, 0)',
          background: 'rgb(255, 255, 255)',
        })
      }
      await panel.screenshot({
        path: `${testInfo.project.outputDir}/screenshots/managed-forced-colours-${width}.png`,
      })
    })
  }
})

test.describe('axe, future-ready and the dark footer in view (#60)', () => {
  const show = async (page: Page, target: 'future-ready' | 'footer') => {
    const element = target === 'footer' ? page.getByRole('contentinfo') : page.locator('#future-ready')
    await element.scrollIntoViewIfNeeded()
    await expect(element).toBeInViewport()
    // The header is solid over both: only the hero is an overlay section.
    await expect(page.getByRole('banner')).not.toHaveClass(/\bon-dark\b/)
    return element
  }

  for (const width of [360, 1024, 1440]) {
    for (const target of ['future-ready', 'footer'] as const) {
      test(`${target} in view at ${width}px`, async ({ page }, testInfo) => {
        await openPage(page, width)
        await show(page, target)

        await expectNoAxeViolations(page, testInfo)
      })
    }

    // Forced colours, with color-contrast off for the reason given for the
    // Managed panel above (Chromium's emulation leaves the authored
    // -webkit-text-fill-color, which axe pairs with the forced
    // background). The footer's links, logo and focus ring are checked as
    // painted instead: the links take the forced link colour on the forced
    // background, the logo is shown at its full size, and a focused link
    // draws a solid ring. The logo's wordmark contrast in light and dark
    // forced themes is checked in forced-colours-logo.spec.ts.
    test(`footer in view, forced colours, at ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ forcedColors: 'active' })
      await openPage(page, width)
      const footer = await show(page, 'footer')

      const results = await new AxeBuilder({ page })
        .withTags(AXE_TAGS)
        .disableRules(['color-contrast'])
        .analyze()
      expect(
        results.violations,
        `axe violations in "${testInfo.title}":\n${formatViolations(results.violations)}`,
      ).toEqual([])

      const painted = await footer.evaluate((root) => ({
        background: getComputedStyle(root).backgroundColor,
        links: [...root.querySelectorAll('a')].map((link) => getComputedStyle(link).color),
        logo: (() => {
          const box = root.querySelector('img')!.getBoundingClientRect()
          return { width: box.width, height: box.height }
        })(),
      }))
      for (const colour of painted.links) expect(colour).not.toBe(painted.background)
      expect(painted.logo.width).toBeGreaterThanOrEqual(120)
      expect(painted.logo.height).toBeGreaterThan(0)

      const phone = footer.getByRole('link', { name: '+256 752 008822' })
      await phone.focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      await expect(phone).toBeFocused()
      const ring = await phone.evaluate((link) => {
        const style = getComputedStyle(link)
        return { visible: link.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth }
      })
      expect(ring).toEqual({ visible: true, style: 'solid', width: '2px' })
      await footer.screenshot({
        path: `${testInfo.project.outputDir}/screenshots/footer-forced-colours-${width}.png`,
      })
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
      const sector = document.querySelector('.solution-row__chevron')
      if (!chevron || !sector) throw new Error('No chevron found')
      const card = document.querySelector('.service-card')
      if (!card) throw new Error('No service card found')
      return {
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
        chevron: getComputedStyle(chevron).transitionDuration,
        sector: getComputedStyle(sector).transitionDuration,
        sectorProperty: getComputedStyle(sector).transitionProperty,
        sectorEasing: getComputedStyle(sector).transitionTimingFunction,
        card: getComputedStyle(card).transitionDuration,
        cardEasing: getComputedStyle(card).transitionTimingFunction,
      }
    })

  // The first Solutions row's button and its chevron's nudge (#59).
  const sector = (page: Page) =>
    page.getByRole('region', { name: 'Solutions' }).getByRole('button').first()
  // Its title: at 1440 the summary sits over the middle of the button.
  const sectorTitle = (page: Page) => sector(page).locator('.solution-row__title')
  const sectorShift = (page: Page) =>
    sector(page).evaluate((button) => getComputedStyle(button.querySelector('svg')!).translate)

  // The hero's two calls to action, one of each button style, both
  // visible at 1440px.
  const buttonDurations = async (page: Page) => {
    const links = {
      'Discuss your data needs': page
        .getByRole('region', { name: 'Trusted Data. Better Decisions.' })
        .getByRole('link', { name: 'Discuss your data needs' }),
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
    expect(ms(result.sector), 'Solutions chevron').toBeLessThanOrEqual(0.01)

    // The Solutions chevron does not move on hover, and still turns to
    // show the open state, with no transition.
    await sectorTitle(page).hover()
    expect(await sectorShift(page), 'Solutions chevron on hover').toBe('none')
    await sectorTitle(page).click()
    await expect(sector(page)).toHaveAttribute('aria-expanded', 'true')
    expect(await sectorShift(page), 'open Solutions chevron on hover').toBe('none')
    // Polled: every property still has a 0.01ms transition here. A half
    // turn is matrix(-1, ~0, ~0, -1, 0, 0).
    await expect
      .poll(() =>
        sector(page).evaluate((button) =>
          getComputedStyle(button.querySelector('svg')!)
            .transform.replace(/^matrix\(|\)$/g, '')
            .split(',')
            .map((value) => Math.round(parseFloat(value))),
        ),
      )
      .toEqual([-1, 0, 0, -1, 0, 0])
    await sectorTitle(page).click()

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

  test('no-preference: smooth scrolling, 150ms button transitions and the card-hover nudge', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openPage(page, 1440)
    const buttons = await buttonDurations(page)

    const moved = await durations(page)
    expect(moved.scroll).toBe('smooth')
    // The Solutions chevron turns over --duration-fast (150ms), and on
    // hover nudges --cta-arrow-shift (4px) down, or up once open (#59),
    // over the service cards' hover duration and easing (#61).
    expect(moved.sectorProperty).toBe('transform, translate')
    expect(moved.sector).toBe(
      `${await tokenDuration(page, '--duration-fast')}, ${await tokenDuration(page, '--duration-card-hover')}`,
    )
    expect(moved.card.split(', ')[0]).toBe(await tokenDuration(page, '--duration-card-hover'))
    expect(moved.sectorEasing.split(', ')[0]).toBe(moved.cardEasing.split(', ')[0])
    // Solutions reveals as it scrolls into view (#61): let it finish, so
    // the pointer is not left over a row that has since moved.
    await sector(page).scrollIntoViewIfNeeded()
    await waitForMotion(page)
    expect(await sectorShift(page)).toBe('none')
    await sectorTitle(page).hover()
    await expect.poll(() => sectorShift(page)).toBe('0px 4px')
    await sectorTitle(page).click()
    await expect(sector(page)).toHaveAttribute('aria-expanded', 'true')
    await expect.poll(() => sectorShift(page)).toBe('0px -4px')
    await sectorTitle(page).click()
    await page.mouse.move(0, 799)
    await expect.poll(() => sectorShift(page)).toBe('none')
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

// The closing call to action's arrow (#60): it moves --cta-arrow-shift
// on hover and on keyboard focus, and not at all under reduced motion.
test.describe('closing call to action arrow', () => {
  for (const motion of ['reduce', 'no-preference'] as const) {
    test(`moves ${motion === 'reduce' ? 'not at all' : '4px'} on hover and focus, ${motion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion })
      await openPage(page, 1440)
      const contact = page.locator('#contact')
      const button = contact.getByRole('link', { name: 'Discuss your data needs' })
      const shift = () => button.evaluate((link) => getComputedStyle(link.querySelector('.button__arrow')!).translate)
      const expected = motion === 'reduce' ? 'none' : '4px'
      await button.scrollIntoViewIfNeeded()
      await page.waitForTimeout(motion === 'reduce' ? 0 : 1000)

      expect(await shift()).toBe('none')
      await button.hover()
      await expect.poll(shift, { message: 'arrow on hover' }).toBe(expected)
      await page.mouse.move(0, 0)
      await expect.poll(shift).toBe('none')
      // Shift+Tab back from the address, so the focus is a keyboard one.
      await contact.getByRole('link', { name: 'info@fafanua.tech' }).focus()
      await page.keyboard.press('Shift+Tab')
      await expect(button).toBeFocused()
      expect(await button.evaluate((link) => link.matches(':focus-visible'))).toBe(true)
      await expect.poll(shift, { message: 'arrow on focus' }).toBe(expected)
    })
  }
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

  test('no horizontal scroll with all five Solutions rows open', async ({ page }) => {
    await openAllSectors(page)

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
  for (const motion of ['no-preference', 'reduce'] as const) {
    test(`Tab and Shift+Tab keep every stop wholly visible at 1024 x 800, ${motion}`, async ({ page }) => {
      // With motion allowed the sections below the first screen start
      // hidden (#61), and focus entering one shows it at once.
      await page.emulateMedia({ reducedMotion: motion })
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

      // Solutions is in its below-64em layout: each summary below its
      // row's title, not beside it (#59).
      const rows = await page
        .getByRole('region', { name: 'Solutions' })
        .getByRole('list')
        .first()
        .locator(':scope > li')
        .evaluateAll((items) =>
          items.map((item) => ({
            titleBottom: item.querySelector('h3')!.getBoundingClientRect().bottom,
            summaryTop: item.querySelector('h3 + ul')!.getBoundingClientRect().top,
          })),
        )
      expect(rows).toHaveLength(5)
      for (const row of rows) {
        expect(row.summaryTop, JSON.stringify(row)).toBeGreaterThanOrEqual(row.titleBottom - 1)
      }
      // The How We Work timeline is vertical: one left edge, each stage
      // below the last.
      const stages = await page
        .getByRole('region', { name: 'How We Work' })
        .getByRole('listitem')
        .evaluateAll((items) =>
          items.map((item) => {
            const box = item.getBoundingClientRect()
            return { left: Math.round(box.left), top: box.top, bottom: box.bottom }
          }),
        )
      expect(new Set(stages.map((stage) => stage.left)).size, 'timeline columns').toBe(1)
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i].top, `stage ${i + 1} below stage ${i}`).toBeGreaterThanOrEqual(stages[i - 1].bottom)
      }

      await walkFocus(page, SEQUENCE.menu)
    })
  }

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
