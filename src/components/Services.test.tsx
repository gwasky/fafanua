import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import {
  managedServices,
  services,
  servicesIntro,
  stages,
} from '../data/services.ts'
import Services from './Services.tsx'

function renderServices() {
  render(<Services />)
  const section = screen.getByRole('region', { name: 'Services' })
  // While every card is collapsed the section shows three lists: the card
  // grid, then the managed-services capabilities and journey.
  const [grid, capabilities, journey] = within(section).getAllByRole('list')
  const cards = within(grid).getAllByRole('listitem')
  const managed = section.querySelector<HTMLElement>('#managed-services')!
  return { section, grid, cards, capabilities, journey, managed }
}

function expectInOrder(elements: HTMLElement[]) {
  for (let i = 1; i < elements.length; i++) {
    expect(
      elements[i - 1].compareDocumentPosition(elements[i]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  }
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

  it('has the h2, the intro h3, six card h3s and the managed-services h3, and no other headings', () => {
    const { section } = renderServices()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => heading.tagName)).toEqual([
      'H2',
      'H3',
      ...services.map(() => 'H3'),
      'H3',
    ])
    expect(headings[1]).toHaveTextContent(servicesIntro.heading)
    expect(headings.slice(2, 8).map((heading) => heading.textContent)).toEqual(
      services.map((service) => service.name),
    )
    expect(headings[8].textContent).toBe(managedServices.heading)
  })

  it('shows the intro heading and both paragraphs between the h2 and the grid', () => {
    const { section } = renderServices()
    const h2 = within(section).getByRole('heading', { level: 2 })
    const introHeading = within(section).getByRole('heading', {
      name: servicesIntro.heading,
    })
    const paragraphs = servicesIntro.paragraphs.map((text) =>
      within(section).getByText(text),
    )
    const grid = within(section).getAllByRole('list')[0]

    expect(introHeading.tagName).toBe('H3')
    expectInOrder([h2, introHeading, ...paragraphs, grid])
    for (const [index, paragraph] of paragraphs.entries()) {
      expect(paragraph.tagName).toBe('P')
      expect(paragraph.textContent).toBe(servicesIntro.paragraphs[index])
      expect(grid).not.toContainElement(paragraph)
    }
    expect(paragraphs[1].textContent).toContain('\u2014')
  })

  it('lists six cards with name, label and description in data order', () => {
    const { grid, cards } = renderServices()

    expect(grid.tagName).toBe('UL')
    expect(cards).toHaveLength(6)
    cards.forEach((card, index) => {
      const service = services[index]
      expect(
        within(card).getByRole('heading', { level: 3 }),
      ).toHaveTextContent(service.name)
      expect(within(card).getByText(stages[service.stage])).toBeInTheDocument()
      expect(within(card).getByText(service.description).textContent).toBe(
        service.description,
      )
    })
    // Strategy and architecture first, business intelligence last (checked
    // by id, as service wording may only live in services.ts).
    expect(within(cards[0]).getByRole('heading')).toHaveAttribute(
      'id',
      'data-strategy-and-platform-architecture-heading',
    )
    expect(within(cards[5]).getByRole('heading')).toHaveAttribute(
      'id',
      'business-intelligence-and-analytics-heading',
    )
  })

  it('labels the cards Design, Connect, Model, Trust, Govern, Decide', () => {
    const { cards } = renderServices()
    const labels = cards.map((card) =>
      within(card).getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          Object.values(stages).includes(element.textContent ?? ''),
      ).textContent,
    )

    expect(labels).toEqual(['Design', 'Connect', 'Model', 'Trust', 'Govern', 'Decide'])
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

  it('gives the six buttons different names starting with "Typical engagements"', () => {
    renderServices()
    const names = screen
      .getAllByRole('button')
      .map((button) => button.textContent)

    expect(new Set(names).size).toBe(6)
    services.forEach((service) => {
      expect(
        screen.getByRole('button', {
          name: `Typical engagements for ${service.name}`,
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
      const panel = document.getElementById(
        `${service.id}-typical-engagements`,
      )!
      expect(
        within(panel)
          .getAllByRole('listitem')
          .map((item) => item.textContent),
      ).toEqual(service.engagements)
    })
  })

  it('shows the managed-services block after the card grid, outside it, as the section\'s last part', () => {
    const { section, grid, managed } = renderServices()
    const heading = within(section).getByRole('heading', {
      name: managedServices.heading,
    })

    expect(managed).toContainElement(heading)
    expect(grid).not.toContainElement(managed)
    expect(managed.closest('li')).toBeNull()
    expect(section).toContainElement(managed)
    expect(grid.nextElementSibling).toBe(managed)
    expect(managed.nextElementSibling).toBeNull()
  })

  it('shows the eyebrow as a paragraph, then the h3, then the description', () => {
    const { managed } = renderServices()
    const eyebrow = within(managed).getByText(managedServices.eyebrow)
    const heading = within(managed).getByRole('heading')
    const description = within(managed).getByText(managedServices.description)

    expect(eyebrow.tagName).toBe('P')
    expect(heading.tagName).toBe('H3')
    expect(heading).toHaveTextContent(managedServices.heading)
    expect(description.tagName).toBe('P')
    expect(description.textContent).toBe(managedServices.description)
    expectInOrder([eyebrow, heading, description])
  })

  it('lists the 13 capabilities in data order, visible without any interaction', () => {
    const { managed, capabilities } = renderServices()
    const items = within(capabilities).getAllByRole('listitem')

    expect(managed).toContainElement(capabilities)
    expect(capabilities.tagName).toBe('UL')
    expect(items).toHaveLength(13)
    expect(items.map((item) => item.textContent)).toEqual(
      managedServices.capabilities,
    )
    for (const item of items) expect(item).toBeVisible()
  })

  it('shows the journey as an ordered list of three steps after the capabilities', () => {
    const { managed, capabilities, journey } = renderServices()
    const steps = within(journey).getAllByRole('listitem')

    expect(managed).toContainElement(journey)
    expect(journey.tagName).toBe('OL')
    expect(steps.map((step) => step.textContent)).toEqual(
      managedServices.journey,
    )
    expect(managed.textContent).not.toMatch(/\u2192/)
    expectInOrder([capabilities, journey])
  })

  it('gives the block .surface-alt and no stage label, marker, button or link', () => {
    const { managed } = renderServices()

    expect(managed).toHaveClass('surface-alt')
    expect(managed).not.toHaveClass('surface-dark')
    expect(within(managed).queryByRole('button')).toBeNull()
    expect(within(managed).queryByRole('link')).toBeNull()
    expect(managed.querySelector('[tabindex], [aria-hidden]')).toBeNull()
    for (const label of Object.values(stages)) {
      expect(within(managed).queryByText(label)).toBeNull()
    }
  })

  it('does not mention Fafanua Intelligence', () => {
    const { section } = renderServices()
    for (const button of screen.getAllByRole('button')) fireEvent.click(button)

    expect(section.textContent).not.toMatch(/fafanua intelligence/i)
  })
})
