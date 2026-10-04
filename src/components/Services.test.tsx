import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { navigation } from '../data/navigation.ts'
import {
  managedServices,
  services,
  servicesIntro,
  stages,
} from '../data/services.ts'
import { systemFlow } from '../data/systemFlow.ts'
import Services from './Services.tsx'

function renderServices() {
  render(<Services />)
  const section = screen.getByRole('region', { name: servicesIntro.heading })
  // While every card is collapsed the section's first two lists are the
  // lifecycle rail and the card grid; each card holds its tag list, and
  // the managed-services block its capabilities and journey.
  const [rail, grid] = within(section).getAllByRole('list')
  const cards = [...grid.children] as HTMLElement[]
  const managed = section.querySelector<HTMLElement>('#managed-services')!
  const [capabilities, journey] = within(managed).getAllByRole('list')
  const flow = within(section).getByRole('list', { name: systemFlow.heading })
  const diagram = flow.parentElement!
  return { section, rail, grid, cards, capabilities, journey, managed, flow, diagram }
}

// The text a screen reader reads: the element's text without its
// aria-hidden parts.
function spokenText(element: Element) {
  const copy = element.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent
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
  it('is section#services, named by its h2, the approved intro heading', () => {
    const { section } = renderServices()
    const heading = within(section).getByRole('heading', { level: 2 })
    const nav = navigation.find((item) => item.label === 'Services')

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'services')
    expect(heading).toHaveAttribute('id', 'services-heading')
    expect(section).toHaveAttribute('aria-labelledby', 'services-heading')
    expect(heading.textContent).toBe(servicesIntro.heading)
    expect(section).toHaveAccessibleName(servicesIntro.heading)
    // The "Services" link still lands here.
    expect(nav?.id).toBe(section.id)
  })

  it('has the h2, six card h3s, the diagram h3 and the managed-services h3, and no other headings', () => {
    const { section } = renderServices()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => heading.tagName)).toEqual([
      'H2',
      ...services.map(() => 'H3'),
      'H3',
      'H3',
    ])
    expect(headings[0].textContent).toBe(servicesIntro.heading)
    expect(headings.slice(1, 7).map((heading) => heading.textContent)).toEqual(
      services.map((service) => service.name),
    )
    expect(headings[7].textContent).toBe(systemFlow.heading)
    expect(headings[8].textContent).toBe(managedServices.heading)
    expect(within(section).queryByRole('heading', { name: 'Services' })).toBeNull()
  })

  it('opens with the eyebrow, the h2, the two intro paragraphs, the rail, then the grid', () => {
    const { section, rail, grid } = renderServices()
    const eyebrow = within(section).getByText('01 — Capabilities')
    const h2 = within(section).getByRole('heading', { level: 2 })
    const paragraphs = servicesIntro.paragraphs.map((text) =>
      within(section).getByText(text),
    )

    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow.textContent).toBe('01 \u2014 Capabilities')
    expectInOrder([eyebrow, h2, ...paragraphs, rail, grid])
    for (const [index, paragraph] of paragraphs.entries()) {
      expect(paragraph.tagName).toBe('P')
      expect(paragraph.textContent).toBe(servicesIntro.paragraphs[index])
      expect(grid).not.toContainElement(paragraph)
      expect(rail).not.toContainElement(paragraph)
    }
    expect(paragraphs[1].textContent).toContain('\u2014')
    // Nothing comes before the eyebrow.
    expect(section.textContent!.startsWith('01 \u2014 Capabilities')).toBe(true)
  })

  it('shows the lifecycle rail: six stages, 01 Design to 06 Decide, with hidden numbers', () => {
    const { rail } = renderServices()
    const items = within(rail).getAllByRole('listitem')

    expect(rail.tagName).toBe('OL')
    expect(items.map(spokenText)).toEqual([
      'Design',
      'Connect',
      'Model',
      'Trust',
      'Govern',
      'Decide',
    ])
    items.forEach((item, index) => {
      const number = String(index + 1).padStart(2, '0')
      const hidden = [...item.querySelectorAll('[aria-hidden="true"]')]
      expect(hidden.map((element) => element.textContent)).toContain(number)
      expect(item.textContent).toBe(`${number}${stages[services[index].stage]}`)
    })
  })

  it('puts no link, button or tab stop in the rail', () => {
    const { rail } = renderServices()

    expect(within(rail).queryAllByRole('link')).toHaveLength(0)
    expect(within(rail).queryAllByRole('button')).toHaveLength(0)
    expect(rail.querySelector('a, button, [tabindex]')).toBeNull()
  })

  it('lists six cards with name, label, description and tags in data order', () => {
    const { grid, cards } = renderServices()

    expect(grid.tagName).toBe('UL')
    expect(cards).toHaveLength(6)
    cards.forEach((card, index) => {
      const service = services[index]
      const heading = within(card).getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent(service.name)
      expect(spokenText(heading.nextElementSibling!)).toBe(stages[service.stage])
      expect(within(card).getByText(service.description).textContent).toBe(
        service.description,
      )
      const [tags] = within(card).getAllByRole('list')
      expect(
        within(tags).getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(service.tags)
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

  it('labels the cards 01 Design to 06 Decide, read as the label alone', () => {
    const { cards } = renderServices()
    const lines = cards.map(
      (card) => within(card).getByRole('heading').nextElementSibling!,
    )

    expect(lines.map(spokenText)).toEqual(['Design', 'Connect', 'Model', 'Trust', 'Govern', 'Decide'])
    expect(lines.map((line) => line.textContent)).toEqual([
      '01Design',
      '02Connect',
      '03Model',
      '04Trust',
      '05Govern',
      '06Decide',
    ])
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
    expect(grid.nextElementSibling!.nextElementSibling).toBe(managed)
    expect(managed.nextElementSibling).toBeNull()
  })

  it('shows the system diagram directly after the card grid and before the managed-services block', () => {
    const { section, grid, managed, flow, diagram } = renderServices()
    const heading = within(diagram).getByRole('heading', { level: 3 })

    expect(section).toContainElement(diagram)
    expect(grid).not.toContainElement(diagram)
    expect(managed).not.toContainElement(diagram)
    expect(diagram.tagName).toBe('DIV')
    expect(diagram.firstElementChild).toBe(heading)
    expect(heading.textContent).toBe(systemFlow.heading)
    expect(grid.nextElementSibling).toBe(diagram)
    expect(diagram.nextElementSibling).toBe(managed)
    expect(flow.children).toHaveLength(6)
    // It ends at activation: Reverse ETL is in its last layer, the last
    // thing before the managed-services content.
    expect(flow.lastElementChild).toHaveTextContent('Reverse ETL')
  })

  it('adds no link, button or tab stop to the section', () => {
    const { diagram } = renderServices()

    expect(diagram.querySelector('a, button, [tabindex]')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(6)
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
