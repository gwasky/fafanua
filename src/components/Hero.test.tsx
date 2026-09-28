import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Hero from './Hero.tsx'

const HEADING = 'Build a data foundation you can trust.'
const SUPPORTING =
  'Fafanua helps organisations design, build and strengthen the data foundations required for reliable reporting, better decisions and responsible AI.'
const STATEMENT =
  'Fafanua helps East African businesses, government institutions and development organisations establish trusted data foundations for reliable reporting, better decisions and future governed analytics and AI.'

function renderHero() {
  render(<Hero />)
  return screen.getByRole('region', { name: HEADING })
}

describe('Hero', () => {
  it('has exactly one level 1 heading, which names the section', () => {
    const hero = renderHero()
    const headings = within(hero).getAllByRole('heading')

    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(HEADING, { normalizeWhitespace: false })
    expect(within(hero).getByRole('heading', { level: 1 })).toBe(headings[0])
    expect(hero).toHaveAccessibleName(HEADING)
  })

  it('shows the supporting line and positioning statement exactly', () => {
    const hero = renderHero()

    expect(within(hero).getByText(SUPPORTING).textContent).toBe(SUPPORTING)
    expect(within(hero).getByText(STATEMENT).textContent).toBe(STATEMENT)
  })

  it('links the primary call to action to #contact and the secondary to #services', () => {
    const hero = renderHero()
    const links = within(hero).getAllByRole('link')

    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAccessibleName('Contact our team')
    expect(links[0]).toHaveAttribute('href', '#contact')
    expect(links[1]).toHaveAccessibleName('See our services')
    expect(links[1]).toHaveAttribute('href', '#services')
    for (const link of links) {
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('aria-label')
    }
  })

  it('keeps the order heading, supporting line, calls to action, statement', () => {
    const hero = renderHero()
    const order = [
      within(hero).getByRole('heading', { level: 1 }),
      within(hero).getByText(SUPPORTING),
      ...within(hero).getAllByRole('link'),
      within(hero).getByText(STATEMENT),
    ]

    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('contains no other landmark and no emphasis or line breaks', () => {
    const hero = renderHero()

    for (const role of ['region', 'navigation', 'complementary', 'banner', 'contentinfo']) {
      expect(within(hero).queryAllByRole(role)).toHaveLength(0)
    }
    expect(hero.querySelector('em, i, strong, b, br, img, svg')).toBeNull()
    expect(hero.textContent).not.toContain(' ')
  })

  it('does not mention Fafanua Intelligence', () => {
    const hero = renderHero()

    expect(within(hero).queryByText(/Intelligence/)).toBeNull()
    expect(hero.textContent).not.toMatch(/Intelligence/)
  })
})
