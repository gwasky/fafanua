import { render, screen, within } from '@testing-library/react'
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
  // The section's first list is the capability grid (#83); the cells hold
  // no lists of their own.
  const [grid] = within(section).getAllByRole('list')
  const cards = [...grid.children] as HTMLElement[]
  // Each cell's stage line, its first child.
  const stageLines = cards.map((card) => card.firstElementChild as HTMLElement)
  const flow = within(section).getByRole('list', { name: systemFlow.heading })
  // The list sits in the diagram's stack and frame (SystemFlow.tsx).
  const diagram = flow.closest('.system-flow') as HTMLElement
  return { section, grid, cards, stageLines, flow, diagram }
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
  it('is section#capabilities, named by its h2, the W3 heading (#83)', () => {
    const { section } = renderServices()
    const heading = within(section).getByRole('heading', { level: 2 })
    const nav = navigation.find((item) => item.label === 'Services')

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'capabilities')
    expect(heading).toHaveAttribute('id', 'capabilities-heading')
    expect(section).toHaveAttribute('aria-labelledby', 'capabilities-heading')
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
    expect(headings.slice(1, 7).map(spokenText)).toEqual(
      services.map((service) => service.name),
    )
    expect(headings[7].textContent).toBe(systemFlow.heading)
    expect(within(section).queryByRole('heading', { name: 'Services' })).toBeNull()
  })

  it('opens with the eyebrow, the h2, the promise line, then the grid, with no other intro paragraphs (#70, #83)', () => {
    const { section, grid } = renderServices()
    const eyebrow = within(section).getByText('01 — Capabilities')
    const h2 = within(section).getByRole('heading', { level: 2 })
    const intro = h2.parentElement!

    expect(eyebrow.tagName).toBe('P')
    expect(eyebrow.textContent).toBe('01 \u2014 Capabilities')
    expect(h2.textContent).toBe(servicesIntro.heading)
    const promise = h2.nextElementSibling as HTMLElement
    expect(promise.tagName).toBe('P')
    expect(promise.textContent).toBe(servicesIntro.promise)
    expectInOrder([eyebrow, h2, promise, grid])
    // The intro holds the eyebrow, the h2 and the promise line and nothing
    // else: the two paragraphs W3 in the trust and lineage plan removed
    // are gone.
    expect([...intro.children]).toEqual([eyebrow, h2, promise])
    expect(intro.nextElementSibling).toBe(grid)
    expect(section.querySelector('.services__intro-text')).toBeNull()
    expect(section.textContent).not.toContain('Fafanua helps organisations')
    expect(section.textContent).not.toContain('Our capabilities span the full data lifecycle')
    expect(h2.textContent).not.toMatch(/business intelligence/i)
    // Nothing comes before the eyebrow.
    expect(section.textContent!.startsWith('01 \u2014 Capabilities')).toBe(true)
  })

  it('shows the highlight as a span inside the unchanged h2 text (#83)', () => {
    const { section } = renderServices()
    const h2 = within(section).getByRole('heading', { level: 2 })
    const spans = h2.querySelectorAll('span')

    expect(h2.textContent).toBe(servicesIntro.heading)
    expect(spans).toHaveLength(1)
    expect(spans[0].textContent).toBe(servicesIntro.highlight)
    expect(spans[0]).toHaveClass('services__highlight')
    expect(spans[0].attributes).toHaveLength(1)
  })

  it('has no lifecycle rail: the grid is the section\'s first list, and nothing outside the cells shows the stages (#83)', () => {
    const { section, grid } = renderServices()

    expect(within(section).getAllByRole('list')[0]).toBe(grid)
    expect(section.querySelector('.lifecycle-rail, .lifecycle-rail-frame, [data-reveal="line"]')).toBeNull()
    // Each stage label shows once in the grid, on its cell's stage line,
    // and not in the header. (The system diagram has its own words.)
    const intro = section.querySelector('.services__intro') as HTMLElement
    for (const label of Object.values(stages)) {
      expect(within(grid).getAllByText(label, { exact: true })).toHaveLength(1)
      expect(within(intro).queryAllByText(label, { exact: true })).toHaveLength(0)
    }
  })

  it('shows six stage lines: 01 Design to 06 Decide, with hidden numbers', () => {
    const { stageLines: items } = renderServices()

    expect(items).toHaveLength(6)
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

  it('puts no link, button, heading, name or tab stop in the stage lines', () => {
    const { stageLines } = renderServices()

    for (const line of stageLines) {
      expect(line.tagName).toBe('P')
      expect(within(line).queryAllByRole('link')).toHaveLength(0)
      expect(within(line).queryAllByRole('button')).toHaveLength(0)
      expect(within(line).queryAllByRole('heading')).toHaveLength(0)
      expect(line.querySelector('a, button, [tabindex], [aria-label], [aria-labelledby]')).toBeNull()
      expect(within(line).getByText(spokenText(line)!)).toBeVisible()
    }
  })

  it('lists six cells, in an ordered list, with stage line, title, description and tags in data order', () => {
    const { grid, cards } = renderServices()

    expect(grid.tagName).toBe('OL')
    expect(grid).toHaveAttribute('role', 'list')
    expect(cards).toHaveLength(6)
    cards.forEach((card, index) => {
      const service = services[index]
      expect(card.tagName).toBe('LI')
      const [stage, heading, description, tags] = [...card.children] as HTMLElement[]
      expect(card.children).toHaveLength(4)
      expect(spokenText(stage)).toBe(stages[service.stage])
      expect(heading).toBe(within(card).getByRole('heading', { level: 3 }))
      expect(spokenText(heading)).toBe(service.name)
      expect(description.tagName).toBe('P')
      expect(description.textContent).toBe(service.description)
      expect(tags.tagName).toBe('P')
      expect(tags.textContent).toBe(service.tags.join(' · '))
      expect(within(card).queryAllByRole('list')).toHaveLength(0)
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

  it('makes each title an h3 whose only link, named by the service, goes to its SEO plan §16 route (#83)', () => {
    const { cards } = renderServices()
    // The literal routes in the SEO plan's §16 table, in data order.
    const routes = [
      '/services/data-strategy-platform-architecture',
      '/services/data-engineering-integration',
      '/services/data-warehousing-analytics-modelling',
      '/services/data-quality-reliability',
      '/services/data-governance-metadata',
      '/services/business-intelligence-analytics',
    ]

    expect(cards).toHaveLength(routes.length)
    cards.forEach((card, index) => {
      const heading = within(card).getByRole('heading', { level: 3 })
      const links = within(heading).getAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAccessibleName(services[index].name)
      expect(links[0]).toHaveAttribute('href', routes[index])
    })
  })

  it('labels the cells 01 Design to 06 Decide, read as the label alone', () => {
    const { cards } = renderServices()
    const lines = cards.map(
      (card) => within(card).getByRole('heading').previousElementSibling!,
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

  it('has one link per cell, the title, with its arrow hidden', () => {
    const { cards } = renderServices()

    cards.forEach((card, index) => {
      const links = within(card).getAllByRole('link')
      expect(links).toHaveLength(1)
      expect(card.querySelectorAll('a, button, [tabindex]')).toHaveLength(1)
      expect(links[0]).toHaveAccessibleName(services[index].name)
      const hidden = [...links[0].querySelectorAll('[aria-hidden="true"]')]
      expect(hidden).toHaveLength(1)
      expect(hidden[0].textContent!.trim()).toBe('→')
    })
  })

  it('has no button, disclosure, hidden panel or Typical engagements in the header and grid (#83)', () => {
    const { section, grid } = renderServices()
    const intro = section.querySelector('.services__intro')!

    for (const part of [intro, grid]) {
      expect(within(part as HTMLElement).queryAllByRole('button')).toHaveLength(0)
      expect(part.querySelector('button, [aria-expanded], [aria-controls], [hidden]')).toBeNull()
    }
    expect(section.textContent).not.toContain('Typical engagements')
    for (const service of services) {
      for (const item of service.engagements) {
        expect(grid.textContent, item).not.toContain(item)
      }
    }
  })

  it('still holds every service\'s engagements in the data, for the service pages (#83)', () => {
    for (const service of services) {
      expect(service.engagements.length).toBeGreaterThan(0)
    }
  })

  it('uses no stage colour classes or markers (#83)', () => {
    const { grid } = renderServices()
    expect(grid.querySelector('[class*="service-card--"], [style]')).toBeNull()
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
    // No journey: the one unlabelled ordered list is the capability grid.
    expect([...section.querySelectorAll('ol:not([aria-labelledby])')]).toEqual([
      within(section).getAllByRole('list')[0],
    ])
  })

  it('shows the system diagram directly after the grid, as the section\'s last part', () => {
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
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    // The six title links are the section's only links and tab stops.
    expect(screen.getAllByRole('link')).toHaveLength(6)
  })

  it('does not mention Fafanua Intelligence', () => {
    const { section } = renderServices()

    expect(section.textContent).not.toMatch(/fafanua intelligence/i)
  })
})
