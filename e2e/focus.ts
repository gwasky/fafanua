import { expect, type Page } from '@playwright/test'
import { services } from '../src/data/services.ts'
import { focusAndHeaderBoxes, focusedName, pressTab, waitForScrollSettle } from './fixtures.ts'

// The page's Tab order, shared by keyboard.spec.ts and the enlarged-text
// checks in a11y.spec.ts, and the WCAG 2.4.11 check that the header never
// covers the focused element.

export const disclosures = services.map((service) => `Typical engagements for ${service.name}`)
// The header's four section links and its call to action, which replaces
// a Contact link; the footer keeps Contact.
const sections = ['Services', 'Solutions', 'How We Work', 'About']
export const nav = [...sections, 'Discuss a project']
const footerNav = [...sections, 'Contact']
const fromHero = [
  'Contact our team',
  'See our services',
  ...disclosures,
  'Email us',
  'info@fafanua.tech',
  ...footerNav,
  'info@fafanua.tech',
]

/** Every Tab stop, with the inline nav and with the Menu toggle. */
export const SEQUENCE = {
  inline: ['Skip to content', 'Fafanua Technologies', ...nav, ...fromHero],
  menu: ['Skip to content', 'Fafanua Technologies', 'Menu', ...fromHero],
}

/**
 * Presses Tab, or Shift+Tab when `shift` is set, and expects the named
 * element to take focus.
 */
export async function tabTo(page: Page, name: string, { shift = false } = {}) {
  await pressTab(page, { shift })
  expect(await focusedName(page)).toBe(name)
}

/**
 * Once scrolling has settled, expects the focused element, unless it is
 * in the header, to be wholly below the header and inside the viewport.
 */
export async function expectUnobscured(page: Page, name: string) {
  await waitForScrollSettle(page)
  const { inHeader, focused, header, viewport } = await focusAndHeaderBoxes(page)
  if (inHeader) return
  const detail = `"${name}": ${JSON.stringify({ focused, header, viewport })}`
  expect(focused.left, `${detail} left edge`).toBeGreaterThanOrEqual(0)
  expect(focused.right, `${detail} right edge`).toBeLessThanOrEqual(viewport.width)
  // Scroll positions are whole pixels and boxes are not, so an edge can
  // sit up to 1px past the one it is aligned to. A header that does not
  // stick may have scrolled away, leaving the viewport's top.
  expect(focused.top, `${detail} top below the header`).toBeGreaterThanOrEqual(
    Math.max(0, header.bottom) - 1,
  )
  expect(focused.bottom, `${detail} bottom in the viewport`).toBeLessThanOrEqual(viewport.height + 1)
}

/** Tabs through every stop, then Shift+Tabs back, checking each one. */
export async function walkFocus(page: Page, sequence: string[]) {
  for (const name of sequence) {
    await tabTo(page, name)
    await expectUnobscured(page, name)
  }
  for (const name of [...sequence].reverse().slice(1)) {
    await tabTo(page, name, { shift: true })
    await expectUnobscured(page, name)
  }
}
