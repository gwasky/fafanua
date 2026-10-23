import { expect, type Page } from '@playwright/test'
import { managedServices, services } from '../src/data/services.ts'
import { email, phone } from '../src/data/contact.ts'
import { futureReadyLinkText } from '../src/data/futureReady.ts'
import { footerSolutions, homepageSolutions } from '../src/data/solutions.ts'
import { focusAndHeaderBoxes, focusedName, pressTab, waitForScrollSettle } from './fixtures.ts'

// The page's Tab order, shared by keyboard.spec.ts and the enlarged-text
// checks in a11y.spec.ts, and the WCAG 2.4.11 check that the header never
// covers the focused element.

// Each capability cell's title links to the service's page (#67), the
// cell's one stop since the open grid (#83), named by the service; the
// Managed Services journey's first two steps link to the sections they
// name, and its service link to its page (#88).
export const cards = services.map((service) => service.name)
// The Solutions rows' links (#59; links, not buttons, since #89), each
// named by its sector title: the homepage's three sectors, in W7's order
// (#73).
export const sectors = homepageSolutions.map((solution) => solution.title)
// The footer's "More sectors" links (#73), after the phone number and the
// copyright, named by the sectors' headings.
export const moreSectors = footerSolutions.map((solution) => solution.heading)
// The header's four section links and its call to action, which replaces
// a Contact link; the footer keeps Contact.
const sections = ['Services', 'Solutions', 'How We Work', 'About']
export const nav = [...sections, 'Book a data trust assessment']
const footerNav = [...sections, 'Contact']
// The hero has two stops: its call to action (#68), which shares the
// header's and the closing button's name, then its text link to the
// capabilities (#83); the Data Trust Assessment's button (#71), the same
// name again, is its section's one stop.
const fromHero = [
  'Book a data trust assessment',
  'Explore our capabilities',
  'Book a data trust assessment',
  ...cards,
  managedServices.journey[0],
  managedServices.journey[1],
  managedServices.heading,
  ...sectors,
  // The future-ready section's one stop, its link to the assessment (#91).
  futureReadyLinkText,
  // The closing call to action (#60): the button, which shares the hero
  // button's name, then the address and the phone number.
  'Book a data trust assessment',
  email,
  phone,
  ...footerNav,
  email,
  phone,
  ...moreSectors,
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
