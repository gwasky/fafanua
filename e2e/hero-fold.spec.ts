import { expect } from '@playwright/test'
import { openPage, test, waitForScrollSettle } from './fixtures.ts'

// The hero's calls to action on the first screen below 64em, and its
// desktop spacing and type unchanged (owner decision on #63, which
// tightened the hero below 64em only, for the longer refinement-plan
// supporting copy). Runs in the chromium and webkit projects.

const HEADING = 'Trusted Data. Better Decisions.'

/** The calls to action's boxes, at scroll 0, and the header's bottom. */
async function ctas(page: import('@playwright/test').Page) {
  const hero = page.getByRole('region', { name: HEADING })
  const links = hero.getByRole('link')
  await expect(links).toHaveCount(2)
  return page.evaluate(() => {
    const section = document.querySelector('main > [data-header-overlay]')!
    const [primary, secondary] = [...section.querySelectorAll('a')].map((link) => {
      const { top, bottom, width, height } = link.getBoundingClientRect()
      return { top, bottom, width, height, name: link.textContent }
    })
    return {
      primary,
      secondary,
      header: document.querySelector('header')!.getBoundingClientRect().bottom,
      scrollY: window.scrollY,
    }
  })
}

for (const { width, height, both } of [
  { width: 360, height: 640, both: false },
  { width: 360, height: 800, both: true },
  { width: 390, height: 844, both: true },
  { width: 768, height: 1024, both: true },
]) {
  test(`the primary CTA${both ? ' and the secondary' : ''} fully visible at scroll 0 at ${width} x ${height}`, async ({ page }) => {
    await openPage(page, width, height)
    await waitForScrollSettle(page)
    const m = await ctas(page)
    const detail = JSON.stringify(m)

    expect(m.scrollY, detail).toBe(0)
    for (const cta of both ? [m.primary, m.secondary] : [m.primary]) {
      expect(cta.top, detail).toBeGreaterThanOrEqual(m.header)
      expect(cta.bottom, detail).toBeLessThanOrEqual(height)
    }
    // Touch targets stay at least 44 x 44.
    for (const cta of [m.primary, m.secondary]) {
      expect(cta.width, detail).toBeGreaterThanOrEqual(44)
      expect(cta.height, detail).toBeGreaterThanOrEqual(44)
    }
  })
}

// Below 64em: less padding above the h1, tighter gaps and body-size
// supporting copy. From 64em: the spacing and type from before #63.
for (const { width, desktop } of [
  { width: 360, desktop: false },
  { width: 768, desktop: false },
  { width: 1024, desktop: true },
  { width: 1440, desktop: true },
]) {
  test(`hero spacing and supporting copy size at ${width}px`, async ({ page }) => {
    await openPage(page, width, 900)
    const m = await page.evaluate(() => {
      const px = (element: Element, property: string) =>
        parseFloat(getComputedStyle(element).getPropertyValue(property))
      const token = (name: string) => {
        const probe = document.createElement('div')
        probe.style.width = `var(${name})`
        document.body.append(probe)
        const value = probe.getBoundingClientRect().width
        probe.remove()
        return value
      }
      const section = document.querySelector('main > [data-header-overlay]')!
      const lead = section.querySelector('.hero__lead')!
      return {
        paddingTop: px(section, 'padding-top'),
        header: token('--header-height'),
        heading: px(section.querySelector('h1')!, 'margin-bottom'),
        promise: px(section.querySelector('.hero__promise')!, 'margin-bottom'),
        lead: px(lead, 'margin-bottom'),
        leadSize: px(lead, 'font-size'),
        leadLineHeight: px(lead, 'line-height') / px(lead, 'font-size'),
        tokens: {
          space4: token('--space-4'),
          space6: token('--space-6'),
          space8: token('--space-8'),
          space12: token('--space-12'),
          base: token('--text-base'),
          bodyLg: token('--text-body-lg'),
        },
      }
    })
    const t = m.tokens
    const detail = JSON.stringify(m)

    expect(m.paddingTop, detail).toBeCloseTo(m.header + t.space12, 0)
    expect([m.heading, m.promise, m.lead], detail).toEqual(
      desktop ? [t.space6, t.space6, t.space8] : [t.space4, t.space4, t.space6],
    )
    expect(m.leadSize, detail).toBeCloseTo(desktop ? t.bodyLg : t.base, 1)
    // A readable line height either way.
    expect(m.leadLineHeight, detail).toBeCloseTo(1.6, 2)
  })
}
