import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Hero from './Hero.tsx'

const HEADING = 'Trusted Data. Better Decisions.'
const PROMISE = 'Build a data foundation you can trust.'
const SUPPORTING =
  'Fafanua helps organisations build and strengthen the data foundations behind their reporting, analytics and operations — connecting fragmented systems, improving trust in data, and turning organisational information into reliable business intelligence.'

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

  it('shows the supporting copy exactly', () => {
    const hero = renderHero()

    expect(within(hero).getByText(SUPPORTING).textContent).toBe(SUPPORTING)
  })

  it('links the primary call to action to #contact and the secondary to #services', () => {
    const hero = renderHero()
    const links = within(hero).getAllByRole('link')

    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAccessibleName('Discuss your data needs')
    expect(links[0]).toHaveAttribute('href', '#contact')
    expect(links[0]).toHaveClass('button')
    expect(links[0]).not.toHaveClass('button--secondary')
    expect(links[1]).toHaveAccessibleName('Explore our capabilities')
    expect(links[1]).toHaveAttribute('href', '#services')
    expect(links[1]).toHaveClass('button', 'button--secondary')
    for (const link of links) {
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('aria-label')
    }
  })

  it('ends only the primary call to action with a hidden arrow', () => {
    const hero = renderHero()
    const [primary, secondary] = within(hero).getAllByRole('link')
    const arrow = primary.querySelector('.button__arrow')

    expect(primary.textContent).toBe('Discuss your data needs→')
    expect(arrow).not.toBeNull()
    expect(arrow).toHaveTextContent('→')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
    expect(primary.lastElementChild).toBe(arrow)
    expect(secondary.textContent).toBe('Explore our capabilities')
    expect(secondary.querySelector('.button__arrow')).toBeNull()
  })

  it('keeps the order heading, brand promise, supporting copy, calls to action', () => {
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

  it('has only the heading, the brand promise, the supporting copy and the two links', () => {
    const hero = renderHero()
    const container = hero.querySelector('.container')!

    expect([...container.children].map((child) => child.tagName)).toEqual(['H1', 'P', 'P', 'DIV'])
    expect(hero.querySelectorAll('p')).toHaveLength(2)
    expect(hero.textContent).toBe(
      `${HEADING}${PROMISE}${SUPPORTING}Discuss your data needs→Explore our capabilities`,
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
