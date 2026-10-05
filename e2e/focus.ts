import { expect, type Page } from '@playwright/test'
import { services } from '../src/data/services.ts'
import { solutions } from '../src/data/solutions.ts'
import { focusAndHeaderBoxes, focusedName, pressTab, waitForScrollSettle } from './fixtures.ts'

// The page's Tab order, shared by keyboard.spec.ts and the enlarged-text
// checks in a11y.spec.ts, and the WCAG 2.4.11 check that the header never
// covers the focused element.

export const disclosures = services.map((service) => `Typical engagements for ${service.name}`)
// The Solutions rows' buttons (#59), each named by its sector title.
export const sectors = solutions.map((solution) => solution.title)
// The header's four section links and its call to action, which replaces
// a Contact link; the footer keeps Contact.
const sections = ['Services', 'Solutions', 'How We Work', 'About']
export const nav = [...sections, 'Discuss a project']
const footerNav = [...sections, 'Contact']
const fromHero = [
  'Discuss your data needs',
  'Explore our capabilities',
  ...disclosures,
  ...sectors,
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
 * Once scrolling has settled, expects the focused element and its focus
 * ring, unless it is in the header, to be wholly below the header and
 * inside the viewport.
 */
export async function expectUnobscured(page: Page, name: string) {
  await waitForScrollSettle(page)
  const { inHeader, focused, ring, header, viewport } = await focusAndHeaderBoxes(page)
  if (inHeader) return
  // The ring is drawn outside the box, so it is the ring that must clear
  // the header and stay in the viewport.
  const outer = {
    top: focused.top - ring,
    bottom: focused.bottom + ring,
    left: focused.left - ring,
    right: focused.right + ring,
  }
  const detail = `"${name}": ${JSON.stringify({ focused, ring, header, viewport })}`
  expect(outer.left, `${detail} left edge`).toBeGreaterThanOrEqual(0)
  expect(outer.right, `${detail} right edge`).toBeLessThanOrEqual(viewport.width)
  // Scroll positions are whole pixels and boxes are not, so an edge can
  // sit up to 1px past the one it is aligned to. A header that does not
  // stick may have scrolled away, leaving the viewport's top.
  expect(outer.top, `${detail} ring top below the header`).toBeGreaterThanOrEqual(
    Math.max(0, header.bottom) - 1,
  )
  expect(outer.bottom, `${detail} ring bottom in the viewport`).toBeLessThanOrEqual(viewport.height + 1)
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
