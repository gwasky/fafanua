import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expectLanded, expectNoAxeViolations, openPage, pressTab, scrollThrough, waitForMotion, waitForScrollSettle, WIDTHS } from './fixtures.ts'
import { SEQUENCE, walkFocus } from './focus.ts'
import { AXE_TAGS, formatViolations } from '../src/test/axe.ts'
import { assessmentHeading } from '../src/data/assessment.ts'
import { processIntro } from '../src/data/process.ts'
import { managedServices, servicesIntro } from '../src/data/services.ts'
import { solutionsIntro } from '../src/data/solutions.ts'

// Axe on the production preview in a real browser, where contrast,
// target size and reflow can be measured. Each state is its own test, so
// a failure names the state and width that broke.

// The Solutions section (#59; Health, Financial Services and Education
// since #73), named by its h2, and its three rows, each one link (#89).
const solutionsRegion = (page: Page) => page.getByRole('region', { name: solutionsIntro.heading })
const solutionRows = (page: Page) => solutionsRegion(page).locator('.solution-row')

/** A row's hover tint, drawn by its ::before (#89). */
const rowTint = (row: ReturnType<Page['locator']>) =>
  row.evaluate((element) => getComputedStyle(element, '::before').backgroundColor)

/** Hovers a Solutions row and waits for its tint. */
async function hoverSector(page: Page, index: number) {
  const row = solutionRows(page).nth(index)
  await row.scrollIntoViewIfNeeded()
  await waitForScrollSettle(page)
  await row.hover()
  await expect.poll(() => rowTint(row)).not.toBe('rgba(0, 0, 0, 0)')
}

/** Moves keyboard focus to a Solutions row's link: Tab from the link
 * before it, so the focus is :focus-visible, and waits for its tint. */
async function focusSector(page: Page, index: number) {
  const links = solutionsRegion(page).getByRole('link')
  await expect(links).toHaveCount(3)
  if (index === 0) {
    await links.nth(1).focus()
    await pressTab(page, { shift: true })
  } else {
    await links.nth(index - 1).focus()
    await pressTab(page)
  }
  await expect(links.nth(index)).toBeFocused()
  await waitForScrollSettle(page)
  await expect.poll(() => rowTint(solutionRows(page).nth(index))).not.toBe('rgba(0, 0, 0, 0)')
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

// The disclosures these opened left with the open grid (#83): axe checks
// the grid with a hovered cell and with a focused title instead.
test.describe('axe, a hovered capability cell and a focused title', () => {
  for (const width of WIDTHS) {
    test(`hovered cell, then focused title, at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      await expect(page.getByRole('button', { name: /^Typical engagements/ })).toHaveCount(0)
      const cells = page.locator('#capabilities .services__list > li')
      await expect(cells).toHaveCount(6)
      await cells.nth(4).scrollIntoViewIfNeeded()
      await waitForScrollSettle(page)
      await cells.nth(4).hover()
      await expectNoAxeViolations(page, testInfo)

      await page.mouse.move(0, 0)
      await cells.nth(0).locator('a').focus()
      await pressTab(page)
      await expect(cells.nth(1).locator('a')).toBeFocused()
      await expectNoAxeViolations(page, testInfo)
    })
  }
})

// The rows opened here became links (#89): a row hovered, and a row
// focused, instead.
test.describe('axe, a Solutions row hovered', () => {
  for (const width of [320, 768, 1440]) {
    test(`a row hovered at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      await hoverSector(page, 1)

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

test.describe('axe, a Solutions row focused', () => {
  for (const width of [320, 768, 1440]) {
    test(`a row focused at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      // Focusing a row smooth-scrolls past Services, which is tall at
      // 320px (#66): focusSector lets the scroll end, so any section it
      // reveals has started its reveal before axe waits for motion.
      await focusSector(page, 1)

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

// How We Work's highlight (#90): axe at rest is covered by the page as
// loaded; here with the highlight moved to step 03 by a mouse.
test.describe('axe, How We Work with step 03 hovered', () => {
  test('step 03 hovered at 1440px', async ({ page }, testInfo) => {
    await openPage(page, 1440)
    const steps = page.getByRole('region', { name: processIntro.heading }).getByRole('listitem')
    await steps.nth(2).getByRole('heading').hover()
    await expect(steps.nth(2)).toHaveAttribute('data-highlighted', '')
    await waitForMotion(page)

    await expectNoAxeViolations(page, testInfo)
  })
})

test.describe('axe, a capability cell hovered', () => {
  for (const width of [768, 1440]) {
    test(`second cell hovered at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      const card = page
        .getByRole('region', { name: servicesIntro.heading })
        .getByRole('listitem')
        .filter({ has: page.getByRole('heading', { level: 3 }) })
        .nth(1)
      await card.hover()
      // The hovered cell's graphite 100 tint and its title's teal arrow
      // (#83), once the transition has finished.
      const tint = await page.evaluate(() => {
        const probe = document.createElement('div')
        probe.style.backgroundColor = 'var(--color-surface-alt)'
        document.body.append(probe)
        const value = getComputedStyle(probe).backgroundColor
        probe.remove()
        return value
      })
      await expect.poll(() => card.evaluate((item) => getComputedStyle(item).backgroundColor)).toBe(tint)
      await expect
        .poll(() => card.evaluate((item) => getComputedStyle(item.querySelector('a [aria-hidden="true"]')!).opacity))
        .toBe('1')

      await expectNoAxeViolations(page, testInfo)
    })
  }
})

test.describe('axe, Data Trust Assessment in view (#71)', () => {
  // The section and its illustrative example scrolled into view, at the
  // default text size and with 200% page text.
  for (const width of [320, 360, 1024, 1440]) {
    for (const text of ['100%', '200%'] as const) {
      test(`example in view with ${text} text at ${width}px`, async ({ page }, testInfo) => {
        await openPage(page, width)
        if (text !== '100%') {
          await page.addStyleTag({ content: `html { font-size: ${text}; }` })
          await expect
            .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
            .toBe('32px')
        }
        const section = page.getByRole('region', { name: assessmentHeading })
        const figure = section.getByRole('figure')
        await figure.scrollIntoViewIfNeeded()
        await expect(figure).toBeInViewport()
        await expect(figure.locator('figcaption')).toHaveText('Illustrative example')

        await expectNoAxeViolations(page, testInfo)
        // The section fits the page. (At 1024px with 200% page text the
        // header's inline navigation is wider than the page, which is the
        // header's, noted on #71, so the section is measured, not the page.)
        const { scrollWidth, innerWidth } = await section.evaluate((element) => ({
          scrollWidth: Math.max(element.scrollWidth, element.getBoundingClientRect().right),
          innerWidth: window.innerWidth,
        }))
        expect(scrollWidth, `scrollWidth ${scrollWidth}, innerWidth ${innerWidth}`).toBeLessThanOrEqual(innerWidth)
      })
    }
  }
})

test.describe('axe, Data Trust Assessment in forced colours (#81, #82)', () => {
  // Every rule but color-contrast, as for the Managed Services panel
  // below (owner decision on #58: Chromium's emulation leaves
  // -webkit-text-fill-color authored, which axe pairs with the forced
  // background). Then every drawing in the dark panel (#82) is checked as
  // still drawn: the seven steps' rings and dots, the line joining them,
  // the rating markers, the tiles' rules, the eyebrow row's and the closing
  // strip's hairlines, the facts pill's outline, and the card's and the
  // Trusted chip's transparent borders, each a non-zero solid border in a
  // visible colour; the hollow marker still hollow; and the contour lines
  // not drawn at all.
  for (const width of [390, 1440]) {
    test(`example in view, forced colours, at ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ forcedColors: 'active' })
      await openPage(page, width)
      const section = page.getByRole('region', { name: assessmentHeading })
      const figure = section.getByRole('figure')
      await figure.scrollIntoViewIfNeeded()
      await expect(figure).toBeInViewport()

      const results = await new AxeBuilder({ page })
        .withTags(AXE_TAGS)
        .disableRules(['color-contrast'])
        .analyze()
      expect(
        results.violations,
        `axe violations in "${testInfo.title}":\n${formatViolations(results.violations)}`,
      ).toEqual([])

      const drawn = await section.evaluate((root) => {
        const border = (element: Element, pseudo: string | null, side: 'Top' | 'Left') => {
          const style = getComputedStyle(element, pseudo)
          return {
            width: parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)),
            style: style.getPropertyValue(`border-${side.toLowerCase()}-style`),
            color: style.getPropertyValue(`border-${side.toLowerCase()}-color`),
            background: style.backgroundColor,
            content: pseudo ? style.content : '""',
          }
        }
        const figure = root.querySelector('figure')!
        const names = [...figure.querySelectorAll('ol > li > p:first-child')]
        return {
          rings: names.map((name) => border(name, '::before', 'Top')),
          dots: names.map((name) => border(name, '::after', 'Top')),
          line: [...figure.querySelectorAll('ol > li:not(:last-child)')].map((step) =>
            border(step, '::before', 'Left'),
          ),
          markers: [...figure.querySelectorAll(':scope > ul:last-child > li')].map((chip) =>
            border(chip, '::before', 'Top'),
          ),
          tileRules: [...root.querySelectorAll('h3 + ul > li')].map((tile) => border(tile, '::before', 'Top')),
          eyebrowRule: border(root.querySelector('.section-eyebrow')!.parentElement!, '::after', 'Top'),
          stripRule: border(root.querySelector('.button')!.parentElement!.parentElement!, null, 'Top'),
          pill: border(root.querySelector('h2 + p + p')!, null, 'Top'),
          card: border(figure, null, 'Top'),
          trusted: border(figure.querySelector(':scope > ul:last-child > li')!, null, 'Top'),
          contours: getComputedStyle(root.querySelector('svg')!).display,
          canvas: getComputedStyle(root).backgroundColor,
        }
      })
      const detail = JSON.stringify(drawn)
      const all = [
        ...drawn.rings,
        ...drawn.dots,
        ...drawn.line,
        ...drawn.markers,
        ...drawn.tileRules,
        drawn.eyebrowRule,
        drawn.stripRule,
        drawn.pill,
        drawn.card,
        drawn.trusted,
      ]
      expect(drawn.rings, detail).toHaveLength(7)
      expect(drawn.dots, detail).toHaveLength(7)
      // Six segments join the seven markers into one line.
      expect(drawn.line, detail).toHaveLength(6)
      expect(drawn.markers, detail).toHaveLength(3)
      expect(drawn.tileRules, detail).toHaveLength(4)
      expect(drawn.contours, detail).toBe('none')
      for (const line of all) {
        expect(line.content, detail).toBe('""')
        expect(line.width, detail).toBeGreaterThan(0)
        expect(line.style, detail).toBe('solid')
        expect(line.color, detail).not.toBe('rgba(0, 0, 0, 0)')
        expect(line.color, detail).not.toBe(drawn.canvas)
      }
      for (const ring of drawn.rings) expect(ring.width, detail).toBe(2)
      // The dots are solid: all border.
      for (const dot of drawn.dots) expect(dot.width, detail).toBe(3)
      // The hollow marker is a ring narrower than its half-width, so its
      // centre stays empty.
      const hollow = drawn.markers[2]
      expect(hollow.width, detail).toBe(2)
      expect(hollow.background, detail).not.toBe(hollow.color)
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

    // A journey link (#88) focused from the keyboard, and hovered: paper
    // text with an underline, and the focus ring.
    for (const state of ['focused', 'hovered'] as const) {
      test(`panel in view with a journey link ${state} at ${width}px`, async ({ page }, testInfo) => {
        await openPage(page, width)
        await showPanel(page)
        const link = page
          .getByRole('navigation', { name: managedServices.journeyLabel })
          .getByRole('link', { name: managedServices.journey[1], exact: true })
        if (state === 'focused') {
          await page
            .getByRole('navigation', { name: managedServices.journeyLabel })
            .getByRole('link', { name: managedServices.journey[0], exact: true })
            .focus()
          await page.keyboard.press('Tab')
          await expect(link).toBeFocused()
          expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
        } else {
          await link.hover()
        }
        await expect(link).toBeInViewport()
        expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toBe('underline')

        await expectNoAxeViolations(page, testInfo)
      })
    }

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

      const phone = footer.getByRole('link', { name: '+256 752 008 822' })
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

// The future-ready section as a readiness diagram (#91): axe with the
// section in view, its one link focused by keyboard with its ring fully in
// view, and in forced colours, where the tiles' borders, the goal's dashed
// border, the chip outlines, the hairline and every dot and ring stay
// drawn (they are borders, not backgrounds) and the link shows as a link.
// Forced colours turn color-contrast off for the reason given for the
// Managed panel above.
test.describe('axe, the future-ready section (#91)', () => {
  // Focus scrolls the link into view at once, so its ring is measured
  // where it lands.
  test.use({ reducedMotion: 'reduce' })
  const section = (page: Page) => page.locator('#future-ready')
  const link = (page: Page) => section(page).getByRole('link')

  for (const width of [320, 390, 1024, 1440]) {
    test(`future-ready in view, its link focused by keyboard, at ${width}px`, async ({ page }, testInfo) => {
      await openPage(page, width)
      await section(page).scrollIntoViewIfNeeded()
      await waitForMotion(page)
      await expectNoAxeViolations(page, testInfo)

      // Focus the stop before the link, then Tab to it.
      await link(page).focus()
      await pressTab(page, { shift: true })
      await pressTab(page)
      await expect(link(page)).toBeFocused()
      await waitForScrollSettle(page)
      const ring = await link(page).evaluate((element) => {
        const style = getComputedStyle(element)
        const box = element.getBoundingClientRect()
        const reach = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
        const header = document.querySelector('header')!.getBoundingClientRect().bottom
        return {
          visible: element.matches(':focus-visible'),
          style: style.outlineStyle,
          decoration: style.textDecorationLine,
          inView:
            box.left - reach >= 0 &&
            box.right + reach <= document.documentElement.clientWidth &&
            box.top - reach >= header &&
            box.bottom + reach <= window.innerHeight,
        }
      })
      expect(ring).toEqual({ visible: true, style: 'solid', decoration: 'underline', inView: true })
      await expectNoAxeViolations(page, testInfo)
    })

    test(`future-ready in view, forced colours, at ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ forcedColors: 'active' })
      await openPage(page, width)
      await section(page).scrollIntoViewIfNeeded()
      await waitForMotion(page)

      const results = await new AxeBuilder({ page })
        .withTags(AXE_TAGS)
        .disableRules(['color-contrast'])
        .analyze()
      expect(
        results.violations,
        `axe violations in "${testInfo.title}":\n${formatViolations(results.violations)}`,
      ).toEqual([])

      const painted = await section(page).evaluate((root) => {
        const border = (element: Element, pseudo?: string) => {
          const style = getComputedStyle(element, pseudo)
          return { width: style.borderTopWidth, style: style.borderTopStyle, colour: style.borderTopColor }
        }
        const background = getComputedStyle(root).backgroundColor
        return {
          background,
          tiles: [...root.querySelectorAll('.future-ready__tile')].map((tile) => border(tile)),
          chips: [...root.querySelectorAll('.future-ready__chips > li')].map((chip) => border(chip)),
          hairline: border(root.querySelector('.future-ready__verdict')!),
          dots: [
            ...[...root.querySelectorAll('.future-ready__key')].map((key) => border(key, '::before')),
            ...[...root.querySelectorAll('.future-ready__chips > li')].map((chip) => border(chip, '::before')),
          ],
          text: [...root.querySelectorAll('h2, p, .future-ready__key, .future-ready__condition, li')].map(
            (element) => getComputedStyle(element).color,
          ),
          link: getComputedStyle(root.querySelector('a')!).color,
        }
      })
      const detail = JSON.stringify(painted)
      for (const line of [...painted.tiles, ...painted.chips, painted.hairline, ...painted.dots]) {
        expect(line.style, detail).not.toBe('none')
        expect(parseFloat(line.width), detail).toBeGreaterThan(0)
        expect(line.colour, detail).not.toBe(painted.background)
      }
      expect(painted.tiles.at(-1)!.style, detail).toBe('dashed')
      for (const colour of painted.text) expect(colour, detail).not.toBe(painted.background)
      // The link takes the forced link colour, unlike the text.
      expect(painted.link, detail).not.toBe(painted.background)
      expect(painted.link, detail).not.toBe(painted.text[0])
      await section(page).screenshot({
        path: `${testInfo.project.outputDir}/screenshots/future-ready-forced-colours-${width}.png`,
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

    // The hero's "Explore our capabilities" link (#83) lands the section.
    await page
      .getByRole('region', { name: 'Trusted Data. Better Decisions.' })
      .getByRole('link', { name: 'Explore our capabilities' })
      .click()
    await expect(page).toHaveURL(/#capabilities$/)
    await expectLanded(page, '#capabilities')
    const { headerBottom, top } = await page.evaluate(() => ({
      headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
      top: document.getElementById('capabilities')!.getBoundingClientRect().top,
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
      // The service cards' chevrons left with the open grid (#83).
      if (document.querySelector('.service-card__chevron')) throw new Error('A service card chevron is back')
      // The Solutions chevrons left with the rows' accordions (#89).
      if (document.querySelector('.solution-row__chevron')) throw new Error('A Solutions chevron is back')
      const row = document.querySelector('.solution-row')
      const link = document.querySelector('.solution-row__link')
      const arrow = document.querySelector('.solution-row__arrow')
      if (!row || !link || !arrow) throw new Error('No Solutions row found')
      const tint = getComputedStyle(row, '::before')
      const card = document.querySelector('.services__list > li')
      if (!card) throw new Error('No capability cell found')
      return {
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
        cardProperty: getComputedStyle(card).transitionProperty,
        sector: tint.transitionDuration,
        sectorProperty: tint.transitionProperty,
        sectorEasing: tint.transitionTimingFunction,
        sectorLink: [getComputedStyle(link).transitionProperty, getComputedStyle(link).transitionDuration],
        sectorArrow: [getComputedStyle(arrow).transitionProperty, getComputedStyle(arrow).transitionDuration],
        rowProperty: getComputedStyle(row).transitionProperty,
        card: getComputedStyle(card).transitionDuration,
        cardEasing: getComputedStyle(card).transitionTimingFunction,
      }
    })

  // The first Solutions row (#89) and its hover state: the tint, the
  // underline's colour and the arrow's colour.
  const sector = (page: Page) => solutionRows(page).first()
  const sectorState = (page: Page) =>
    sector(page).evaluate((row) => [
      getComputedStyle(row, '::before').backgroundColor,
      getComputedStyle(row.querySelector('.solution-row__link')!).textDecorationColor,
      getComputedStyle(row.querySelector('.solution-row__arrow')!).color,
    ])
  const probeColour = (page: Page, token: string) =>
    page.evaluate((name) => {
      const probe = document.createElement('div')
      probe.style.color = `var(${name})`
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }, token)

  // One of each button style: the hero's one call to action (#68), the
  // primary, and the header's Menu toggle, the secondary, which shows
  // below 64em (the service cards' disclosures, the secondary example
  // before, left with the open grid, #83). The viewport is narrowed for
  // the toggle, then put back.
  const buttonDurations = async (page: Page) => {
    const results: { name: string; duration: number }[] = []
    const measure = async (name: string, link: ReturnType<Page['getByRole']>) => {
      await expect(link).toBeVisible()
      const duration = await link.evaluate(
        (element) => getComputedStyle(element).transitionDuration,
      )
      results.push({ name, duration: ms(duration) })
    }
    await measure(
      'Book a data trust assessment',
      page
        .getByRole('region', { name: 'Trusted Data. Better Decisions.' })
        .getByRole('link', { name: 'Book a data trust assessment' }),
    )
    const size = page.viewportSize()!
    await page.setViewportSize({ width: 800, height: size.height })
    const toggle = page.getByRole('button', { name: 'Menu' })
    await expect(toggle).toHaveClass(/button--secondary/)
    await measure('Menu', toggle)
    await page.setViewportSize(size)
    return results
  }

  // The header's call to action and its arrow, and the header itself.
  const cta = (page: Page) =>
    page.getByRole('banner').getByRole('link', { name: 'Book a data trust assessment' })

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
    // The capability cells transition nothing at all (#83).
    expect(result.cardProperty, 'capability cell').toBe('none')
    // Nor do the Solutions rows' tint, underline and arrow (#89).
    expect(result.sectorProperty, 'Solutions row tint').toBe('none')
    expect(result.sectorLink[0], 'Solutions row link').toBe('none')
    expect(result.sectorArrow[0], 'Solutions row arrow').toBe('none')
    expect(result.rowProperty, 'Solutions row').toBe('none')

    // The hover still tints the row, underlines the name and turns the
    // arrow teal, at once: read straight after the hover, not polled.
    const [g100, teal800] = [await probeColour(page, '--graphite-100'), await probeColour(page, '--teal-800')]
    await sector(page).scrollIntoViewIfNeeded()
    await sector(page).hover()
    expect(await sectorState(page), 'Solutions row on hover').toEqual([g100, teal800, teal800])
    await page.mouse.move(0, 799)

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

  test('no-preference: smooth scrolling, 150ms button transitions and the cell-hover tint', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openPage(page, 1440)
    const buttons = await buttonDurations(page)

    const moved = await durations(page)
    expect(moved.scroll).toBe('smooth')
    // The Solutions row's tint, underline and arrow change over the
    // capability cells' hover duration and easing (#89, as #83).
    const cardHover = await tokenDuration(page, '--duration-card-hover')
    expect(moved.sectorProperty).toBe('background-color')
    expect(moved.sector).toBe(cardHover)
    expect(moved.sectorLink).toEqual(['text-decoration-color', cardHover])
    expect(moved.sectorArrow).toEqual(['color', cardHover])
    expect(moved.cardProperty).toBe('background-color')
    expect(moved.card.split(', ')[0]).toBe(cardHover)
    expect(moved.sectorEasing.split(', ')[0]).toBe(moved.cardEasing.split(', ')[0])
    // Solutions reveals as it scrolls into view (#61): let it finish, so
    // the pointer is not left over a row that has since moved.
    await sector(page).scrollIntoViewIfNeeded()
    await waitForMotion(page)
    const [g100, teal800] = [await probeColour(page, '--graphite-100'), await probeColour(page, '--teal-800')]
    expect((await sectorState(page))[0]).toBe('rgba(0, 0, 0, 0)')
    await sector(page).hover()
    await expect.poll(() => sectorState(page)).toEqual([g100, teal800, teal800])
    await page.mouse.move(0, 799)
    await expect.poll(async () => (await sectorState(page))[0]).toBe('rgba(0, 0, 0, 0)')
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
      const button = contact.getByRole('link', { name: 'Book a data trust assessment' })
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

  // The disclosures this opened left with the open grid (#83): a hovered
  // capability cell, with its arrow shown, instead.
  test('no horizontal scroll with a capability cell hovered', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Typical engagements/ })).toHaveCount(0)
    const cells = page.locator('#capabilities .services__list > li')
    for (const cell of await cells.all()) {
      await cell.scrollIntoViewIfNeeded()
      await cell.hover()
      await noHorizontalScroll(page)
    }
  })

  // The rows opened here became links (#89): each row focused instead.
  test('no horizontal scroll with each Solutions row focused', async ({ page }) => {
    for (let index = 0; index < 3; index++) {
      await focusSector(page, index)
      await noHorizontalScroll(page)
    }
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

    // The footer's Services link lands the same section as the hero's
    // "Explore our capabilities" link (#83).
    await page.getByRole('contentinfo').getByRole('link', { name: 'Services' }).click()
    await expect(page).toHaveURL(/#capabilities$/)
    await expectLanded(page, '#capabilities')
    const { headerBottom, top } = await page.evaluate(() => ({
      headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
      top: document.getElementById('capabilities')!.getBoundingClientRect().top,
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
    for (const name of ['Services', 'Solutions', 'How We Work', 'About', 'Book a data trust assessment']) {
      await expect(
        page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true }),
      ).toBeVisible()
    }
  })

  // Every Tab and Shift+Tab stop is wholly visible below the sticky
  // header. The content breakpoints are in em too, so at 1024px with 32px
  // text the capability grid is one column (#83).
  for (const motion of ['no-preference', 'reduce'] as const) {
    test(`Tab and Shift+Tab keep every stop wholly visible at 1024 x 800, ${motion}`, async ({ page }) => {
      // With motion allowed the sections below the first screen start
      // hidden (#61), and focus entering one shows it at once.
      await page.emulateMedia({ reducedMotion: motion })
      await openPage(page, 1024)
      expect((await header(page)).position).toBe('sticky')
      // The section's first list is the capability grid (#83); there is no
      // lifecycle rail.
      const lists = page.getByRole('region', { name: servicesIntro.heading }).getByRole('list')
      const lefts = (index: number) =>
        lists
          .nth(index)
          .locator(':scope > li')
          .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().left)))
      const grid = await lefts(0)
      expect(grid, 'capability cells').toHaveLength(6)
      expect(new Set(grid).size, 'capability grid columns').toBe(1)
      expect(await page.locator('.lifecycle-rail').count(), 'lifecycle rail').toBe(0)

      // Solutions is in its below-48em layout: each row's tags below its
      // h3, not beside it (#59, #89).
      const rows = await solutionRows(page).evaluateAll((items) =>
        items.map((item) => ({
          nameBottom: item.querySelector('h3')!.getBoundingClientRect().bottom,
          tagsTop: item.querySelector('.solution-row__tags')!.getBoundingClientRect().top,
        })),
      )
      expect(rows).toHaveLength(3)
      for (const row of rows) {
        expect(row.tagsTop, JSON.stringify(row)).toBeGreaterThanOrEqual(row.nameBottom - 1)
      }
      // The How We Work timeline is vertical: one left edge, each stage
      // below the last.
      const stages = await page
        .getByRole('region', { name: processIntro.heading })
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
