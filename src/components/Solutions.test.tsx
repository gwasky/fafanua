import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import { solutions } from '../data/solutions.ts'
import Solutions from './Solutions.tsx'

function renderSolutions() {
  render(<Solutions />)
  const section = screen.getByRole('region', { name: 'Solutions' })
  const list = section.querySelector<HTMLElement>('.solutions__list')!
  const cards = [...list.children] as HTMLElement[]
  return { section, list, cards }
}

describe('Solutions', () => {
  it('is section#solutions, labelled by the Solutions h2 from the navigation', () => {
    const { section } = renderSolutions()
    const heading = within(section).getByRole('heading', { level: 2 })
    const nav = navigation.find((item) => item.id === 'solutions')

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'solutions')
    expect(section).toHaveAttribute('aria-labelledby', 'solutions-heading')
    expect(heading).toHaveAttribute('id', 'solutions-heading')
    expect(heading.textContent).toBe('Solutions')
    expect(nav?.label).toBe(heading.textContent)
  })

  it('has one h2, then five h3s, and no introduction paragraph', () => {
    const { section, list } = renderSolutions()

    expect(
      within(section).getAllByRole('heading').map((heading) => heading.tagName),
    ).toEqual(['H2', 'H3', 'H3', 'H3', 'H3', 'H3'])
    expect([...list.parentElement!.children].map((child) => child.tagName)).toEqual([
      'H2',
      'UL',
    ])
    expect(section.querySelectorAll('p')).toHaveLength(0)
  })

  it('shows the five sectors as list items, titled in data order', () => {
    const { list, cards } = renderSolutions()

    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('role', 'list')
    expect(cards).toHaveLength(5)
    expect(cards.map((card) => card.tagName)).toEqual(Array(5).fill('LI'))
    expect(
      cards.map((card) => within(card).getByRole('heading', { level: 3 }).textContent),
    ).toEqual([
      'Financial Services',
      'Retail & Distribution',
      'Development & Impact',
      'Education',
      'Public Sector',
    ])
  })

  it('lists each card\'s themes as items of a nested list, in data order', () => {
    const { cards } = renderSolutions()

    cards.forEach((card, index) => {
      const themes = within(card).getByRole('list')
      const [heading, list, ...rest] = card.children

      expect(rest).toHaveLength(0)
      expect(heading.tagName).toBe('H3')
      expect(list).toBe(themes)
      expect(themes.tagName).toBe('UL')
      expect(themes).toHaveAttribute('role', 'list')
      expect(
        within(themes).getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(solutions[index].themes)
    })
  })

  it('contains no links, buttons, images or other tab stops', () => {
    const { section } = renderSolutions()

    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(
      section.querySelectorAll(
        'a, button, input, select, textarea, details, img, svg, [tabindex]',
      ),
    ).toHaveLength(0)
  })

  it('shows no doc labels, client types, stage labels or colour markers', () => {
    const { section } = renderSolutions()

    expect(section.textContent).not.toMatch(
      /suggested|potential|client|\bbanks\b|sacco|\bNGOs\b|case stud|testimonial|fafanua intelligence|saas|\bAI\b/i,
    )
    expect(section.innerHTML).not.toMatch(/service-card|marker|--service|stage/)
    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
  })
})
