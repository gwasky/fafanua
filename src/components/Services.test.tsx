import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import { serviceLines, services } from '../data/services.ts'
import Services from './Services.tsx'

function renderServices() {
  render(<Services />)
  const section = screen.getByRole('region', { name: 'Services' })
  // The card grid is the only list shown while every card is collapsed.
  const cards = within(section).getAllByRole('listitem')
  return { section, cards }
}

describe('Services', () => {
  it('is section#services, labelled by the Services h2 from the navigation', () => {
    const { section } = renderServices()
    const heading = within(section).getByRole('heading', { level: 2 })
    const nav = navigation.find((item) => item.id === 'services')

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'services')
    expect(heading).toHaveAttribute('id', 'services-heading')
    expect(section).toHaveAttribute('aria-labelledby', 'services-heading')
    expect(heading).toHaveTextContent('Services')
    expect(nav?.label).toBe(heading.textContent)
  })

  it('has one h2 and then six h3s, and no other headings', () => {
    const { section } = renderServices()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => heading.tagName)).toEqual([
      'H2',
      ...services.map(() => 'H3'),
    ])
  })

  it('lists six cards with title, label and summary in data order', () => {
    const { section, cards } = renderServices()
    const list = within(section).getByRole('list')

    expect(list.tagName).toBe('UL')
    expect(cards).toHaveLength(6)
    cards.forEach((card, index) => {
      const service = services[index]
      expect(
        within(card).getByRole('heading', { level: 3 }),
      ).toHaveTextContent(service.title)
      expect(
        within(card).getByText(serviceLines[service.serviceLine]),
      ).toBeInTheDocument()
      expect(within(card).getByText(service.summary).textContent).toBe(
        service.summary,
      )
    })
    // Platform architecture first, analytics products last (checked by id,
    // as service wording may only live in services.ts).
    expect(within(cards[0]).getByRole('heading')).toHaveAttribute(
      'id',
      'data-platform-architecture-heading',
    )
    expect(within(cards[5]).getByRole('heading')).toHaveAttribute(
      'id',
      'analytics-and-reporting-products-heading',
    )
  })

  it('labels the cards Build, Build, Build, Trust, Govern, Insights', () => {
    const { cards } = renderServices()
    const labels = cards.map((card) =>
      within(card).getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          Object.values(serviceLines).includes(element.textContent ?? ''),
      ).textContent,
    )

    expect(labels).toEqual(['Build', 'Build', 'Build', 'Trust', 'Govern', 'Insights'])
  })

  it('starts with every card collapsed', () => {
    renderServices()
    const buttons = screen.getAllByRole('button')

    expect(buttons).toHaveLength(6)
    for (const button of buttons) {
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(
        document.getElementById(button.getAttribute('aria-controls')!),
      ).toHaveAttribute('hidden')
    }
  })

  it('gives the six buttons different names starting with "Typical work"', () => {
    renderServices()
    const names = screen
      .getAllByRole('button')
      .map((button) => button.textContent)

    expect(new Set(names).size).toBe(6)
    services.forEach((service) => {
      expect(
        screen.getByRole('button', {
          name: `Typical work for ${service.title}`,
        }),
      ).toBeInTheDocument()
    })
  })

  it('opens one card without opening the others, and all six can be open', () => {
    renderServices()
    const buttons = screen.getAllByRole('button')

    fireEvent.click(buttons[2])
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute(
        'aria-expanded',
        index === 2 ? 'true' : 'false',
      )
    })

    for (const button of buttons) {
      if (button.getAttribute('aria-expanded') === 'false') {
        fireEvent.click(button)
      }
    }
    for (const button of buttons) {
      expect(button).toHaveAttribute('aria-expanded', 'true')
    }
    services.forEach((service) => {
      const panel = document.getElementById(`${service.id}-typical-work`)!
      expect(
        within(panel)
          .getAllByRole('listitem')
          .map((item) => item.textContent),
      ).toEqual(service.typicalWork)
    })
  })

  it('does not mention Fafanua Intelligence', () => {
    const { section } = renderServices()
    for (const button of screen.getAllByRole('button')) fireEvent.click(button)

    expect(section.textContent).not.toMatch(/intelligence/i)
  })
})
