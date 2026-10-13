import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Hero from './Hero.tsx'

const HEADING = 'Trusted Data. Better Decisions.'
const PROMISE = 'Build a data foundation you can trust.'
const SUPPORTING =
  'Fafanua helps organisations in Africa trace their key numbers to the source, so reporting, operations and finance can rely on their data, and analytics and AI have something solid to stand on.'

function renderHero() {
  render(<Hero />)
  return screen.getByRole('region', { name: HEADING })
}

describe('Hero', () => {
  it('has exactly one level 1 heading, which names the section', () => {
    const hero = renderHero()
    const headings = within(hero).getAllByRole('heading')

    expect(headings).toHaveLength(1)
    expect(within(hero).getByRole('heading', { level: 1 })).toBe(headings[0])
    expect(headings[0]).toHaveAccessibleName(HEADING)
    expect(headings[0].textContent).toBe(HEADING)
    expect(hero).toHaveAccessibleName(HEADING)
  })

  it('puts each sentence of the headline in its own line element', () => {
    const hero = renderHero()
    const heading = within(hero).getByRole('heading', { level: 1 })
    const lines = [...heading.children]

    expect(lines.map((line) => line.tagName)).toEqual(['SPAN', 'SPAN'])
    expect(lines.map((line) => line.textContent)).toEqual([
      'Trusted Data.',
      'Better Decisions.',
    ])
  })

  // Protected positioning (owner decision on #61, AGENTS.md): the core
  // brand promise, exactly, as a paragraph directly after the h1 and
  // before the supporting copy.
  it('shows the brand promise exactly, as a paragraph directly after the h1', () => {
    const hero = renderHero()
    const heading = within(hero).getByRole('heading', { level: 1 })
    const promise = within(hero).getByText(PROMISE)

    expect(promise.textContent).toBe(PROMISE)
    expect(promise.tagName).toBe('P')
    expect(promise).toHaveClass('hero__promise')
    expect(heading.nextElementSibling).toBe(promise)
    expect(promise.nextElementSibling).toBe(within(hero).getByText(SUPPORTING))
  })

  it('shows the supporting copy exactly, W2 in the trust and lineage plan (#69), in p.hero__lead', () => {
    const hero = renderHero()
    const lead = within(hero).getByText(SUPPORTING)

    expect(lead.textContent).toBe(SUPPORTING)
    expect(lead.tagName).toBe('P')
    expect(lead).toHaveClass('hero__lead')
    expect(hero.querySelectorAll('.hero__lead')).toHaveLength(1)
    // The refinement plan §2 paragraph it replaced is gone.
    expect(hero.textContent).not.toMatch(/build and strengthen the data foundations/)
    expect(hero.textContent).not.toMatch(/business intelligence/)
  })

  it('has exactly one link, the primary call to action, to #contact (#68)', () => {
    const hero = renderHero()
    const links = within(hero).getAllByRole('link')

    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('Book a data trust assessment')
    expect(links[0]).toHaveAttribute('href', '#contact')
    expect(links[0]).toHaveClass('button')
    expect(links[0]).not.toHaveClass('button--secondary')
    expect(hero.querySelector('.button--secondary')).toBeNull()
    expect(links[0]).not.toHaveAttribute('target')
    expect(links[0]).not.toHaveAttribute('aria-label')
  })

  it('ends the call to action with a hidden arrow', () => {
    const hero = renderHero()
    const [primary] = within(hero).getAllByRole('link')
    const arrow = primary.querySelector('.button__arrow')

    expect(primary.textContent).toBe('Book a data trust assessment→')
    expect(arrow).not.toBeNull()
    expect(arrow).toHaveTextContent('→')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
    expect(primary.lastElementChild).toBe(arrow)
  })

  it('shows none of the retired labels (#68)', () => {
    const hero = renderHero()

    for (const retired of ['Explore our capabilities', 'Discuss your data needs', 'Discuss a project']) {
      expect(hero.textContent).not.toContain(retired)
    }
  })

  it('keeps the order heading, brand promise, supporting copy, call to action', () => {
    const hero = renderHero()
    const order = [
      within(hero).getByRole('heading', { level: 1 }),
      within(hero).getByText(PROMISE),
      within(hero).getByText(SUPPORTING),
      ...within(hero).getAllByRole('link'),
    ]

    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('is a dark overlay section with the technical grid as its first child', () => {
    const hero = renderHero()
    const grids = hero.querySelectorAll('[aria-hidden="true"]:not(.button__arrow)')

    expect(hero.tagName).toBe('SECTION')
    expect(hero).toHaveClass('hero', 'surface-dark')
    expect(hero).toHaveAttribute('data-header-overlay')
    expect(grids).toHaveLength(1)
    expect(hero.firstElementChild).toBe(grids[0])
    expect(hero.firstElementChild).toHaveClass('technical-grid')
    expect(hero.children[1]).toHaveClass('container')
    expect(hero.children).toHaveLength(2)
  })

  it('has only the heading, the brand promise, the supporting copy and the one link', () => {
    const hero = renderHero()
    const container = hero.querySelector('.container')!

    expect([...container.children].map((child) => child.tagName)).toEqual(['H1', 'P', 'P', 'DIV'])
    expect(hero.querySelectorAll('p')).toHaveLength(2)
    expect(hero.textContent).toBe(
      `${HEADING}${PROMISE}${SUPPORTING}Book a data trust assessment→`,
    )
  })

  it('contains no other landmark, and no line breaks, images or emphasis', () => {
    const hero = renderHero()

    for (const role of ['region', 'navigation', 'complementary', 'banner', 'contentinfo']) {
      expect(within(hero).queryAllByRole(role)).toHaveLength(0)
    }
    expect(hero.querySelector('em, i, strong, b, br, img, svg')).toBeNull()
    expect(hero.textContent).not.toContain('\u00a0')
  })

  it('does not mention Fafanua Intelligence or the old hero copy', () => {
    const hero = renderHero()

    expect(hero.textContent).not.toMatch(/Fafanua Intelligence/)
    // The brand promise is back (#61); the rest of the V1 hero is not.
    for (const old of [
      'responsible AI',
      'Contact our team',
      'See our services',
      'East African',
    ]) {
      expect(hero.textContent).not.toContain(old)
    }
  })
})
