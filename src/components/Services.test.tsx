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
  // lifecycle rail and the card grid; each card holds its tag list.
  const [rail, grid] = within(section).getAllByRole('list')
  const cards = [...grid.children] as HTMLElement[]
  const flow = within(section).getByRole('list', { name: systemFlow.heading })
  // The list sits in the diagram's stack and frame (SystemFlow.tsx).
  const diagram = flow.closest('.system-flow') as HTMLElement
  return { section, rail, grid, cards, flow, diagram }
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

  it('has the h2, six card h3s and the diagram h3, and no other headings', () => {
    const { section } = renderServices()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => heading.tagName)).toEqual([
      'H2',
      ...services.map(() => 'H3'),
      'H3',
    ])
    expect(headings[0].textContent).toBe(servicesIntro.heading)
    expect(headings.slice(1, 7).map((heading) => heading.textContent)).toEqual(
      services.map((service) => service.name),
    )
    expect(headings[7].textContent).toBe(systemFlow.heading)
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

  it('no longer holds the Managed Services content, which is its own section', () => {
    const { section } = renderServices()

    expect(section.querySelector('#managed-services')).toBeNull()
    expect(section.querySelector('.surface-dark, .surface-alt')).toBeNull()
    expect(section.querySelector('#managed-services-heading')).toBeNull()
    expect(within(section).getAllByRole('heading', { level: 2 })).toHaveLength(1)
    // Some capabilities, such as the Reverse ETL one, are also service
    // engagements, so only the block's own text is checked.
    for (const text of [
      managedServices.sectionHeading,
      managedServices.eyebrow,
      managedServices.heading,
      managedServices.description,
    ]) {
      expect(section.textContent, text).not.toContain(text)
    }
    expect(within(section).queryByText(managedServices.capabilities[0])).toBeNull()
    // No journey: the one unlabelled ordered list is the lifecycle rail.
    expect([...section.querySelectorAll('ol:not([aria-labelledby])')]).toEqual([
      within(section).getAllByRole('list')[0],
    ])
  })

  it('shows the system diagram directly after the card grid, as the section\'s last part', () => {
    const { section, grid, flow, diagram } = renderServices()
    const heading = within(diagram).getByRole('heading', { level: 3 })

    expect(section).toContainElement(diagram)
    expect(grid).not.toContainElement(diagram)
    expect(diagram.tagName).toBe('DIV')
    expect(diagram.firstElementChild).toBe(heading)
    expect(heading.textContent).toBe(systemFlow.heading)
    expect(grid.nextElementSibling).toBe(diagram)
    expect(diagram.nextElementSibling).toBeNull()
    expect(flow.children).toHaveLength(6)
    // It ends at activation, with Reverse ETL in its last layer, then
    // returns to operational systems, the last thing before the Managed
    // Services section.
    expect(flow.lastElementChild).toHaveTextContent('Reverse ETL')
    expect(diagram.lastElementChild!.lastElementChild).toHaveTextContent(systemFlow.returnTitle)
  })

  it('adds no link, button or tab stop to the section', () => {
    const { diagram } = renderServices()

    expect(diagram.querySelector('a, button, [tabindex]')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(6)
  })

  it('does not mention Fafanua Intelligence', () => {
    const { section } = renderServices()
    for (const button of screen.getAllByRole('button')) fireEvent.click(button)

    expect(section.textContent).not.toMatch(/fafanua intelligence/i)
  })
})
