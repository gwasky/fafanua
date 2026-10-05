import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { managedServices, stages } from '../data/services.ts'
import ManagedServices from './ManagedServices.tsx'

function renderManaged() {
  render(<ManagedServices />)
  const section = screen.getByRole('region', { name: managedServices.sectionHeading })
  const panel = section.querySelector<HTMLElement>('.surface-dark')!
  const [rail, capabilities, journey] = within(section).getAllByRole('list')
  return { section, panel, rail, capabilities, journey }
}

function expectInOrder(elements: HTMLElement[]) {
  for (let i = 1; i < elements.length; i++) {
    expect(
      elements[i - 1].compareDocumentPosition(elements[i]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  }
}

describe('ManagedServices', () => {
  it('is section#managed-services, named by its h2', () => {
    const { section } = renderManaged()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'managed-services')
    expect(section).toHaveAttribute('aria-labelledby', 'managed-services-heading')
    expect(heading).toHaveAttribute('id', 'managed-services-heading')
    expect(section).toHaveAccessibleName('Your data capability, continuously operated.')
  })

  it('holds one .surface-dark panel inside its container, and nothing else', () => {
    const { section, panel } = renderManaged()
    const container = section.firstElementChild!

    expect(section).not.toHaveClass('surface-dark')
    expect(section).not.toHaveClass('surface-alt')
    expect(container).toHaveClass('container')
    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild).toBe(panel)
    expect(panel.tagName).toBe('DIV')
    expect(panel).toHaveClass('surface-dark')
    expect(panel).not.toHaveClass('surface-alt')
    expect(panel).not.toHaveAttribute('data-header-overlay')
    expect(section.querySelectorAll('.surface-dark')).toHaveLength(1)
    expect(section.querySelector('.surface-alt, .technical-grid, [data-header-overlay]')).toBeNull()
    expect(section.querySelector('img, svg, picture, canvas')).toBeNull()
  })

  it('shows the eyebrow, h2, approved eyebrow, h3 and description, exactly, in that order', () => {
    const { panel } = renderManaged()
    const eyebrow = within(panel).getByText('02 — Managed Services')
    const h2 = within(panel).getByRole('heading', { level: 2 })
    const approved = within(panel).getByText(managedServices.eyebrow)
    const h3 = within(panel).getByRole('heading', { level: 3 })
    const description = within(panel).getByText(managedServices.description)

    expect(eyebrow.tagName).toBe('P')
    expect(h2.textContent).toBe('Your data capability, continuously operated.')
    expect(approved.tagName).toBe('P')
    expect(approved.textContent).toBe(managedServices.eyebrow)
    expect(h3.textContent).toBe(managedServices.heading)
    expect(description.tagName).toBe('P')
    expect(description.textContent).toBe(managedServices.description)
    expectInOrder([eyebrow, h2, approved, h3, description])
    // The eyebrow comes first.
    expect(panel.textContent!.startsWith('02 — Managed Services')).toBe(true)
  })

  it('has only the h2 and the h3, in that order', () => {
    const { section } = renderManaged()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => heading.tagName)).toEqual(['H2', 'H3'])
  })

  it('groups the eyebrow with the h2, and the approved eyebrow and description with the h3', () => {
    const { panel } = renderManaged()
    const h2 = within(panel).getByRole('heading', { level: 2 })
    const h3 = within(panel).getByRole('heading', { level: 3 })
    const lead = h2.parentElement!
    const group = h3.parentElement!

    expect(lead).not.toBe(group)
    expect(lead).toContainElement(within(panel).getByText('02 — Managed Services'))
    expect(group).toContainElement(within(panel).getByText(managedServices.eyebrow))
    expect(group).toContainElement(within(panel).getByText(managedServices.description))
    expect(lead.nextElementSibling).toBe(group)
  })

  it('shows the capability rail, Monitor, Maintain, Improve and Activate, after the description', () => {
    const { panel, rail } = renderManaged()
    const items = within(rail).getAllByRole('listitem')

    expect(rail.tagName).toBe('UL')
    expect(rail).toHaveAttribute('role', 'list')
    expect(items.map((item) => item.textContent)).toEqual([
      'Monitor',
      'Maintain',
      'Improve',
      'Activate',
    ])
    expectInOrder([within(panel).getByText(managedServices.description), rail])
  })

  it('draws the rail separators as empty aria-hidden elements, with no text and no numbers', () => {
    const { rail } = renderManaged()
    const separators = [...rail.querySelectorAll('[aria-hidden="true"]')]

    expect(separators).toHaveLength(3)
    for (const separator of separators) {
      expect(separator.textContent).toBe('')
      expect(separator.children).toHaveLength(0)
    }
    // The last item has none.
    expect(rail.lastElementChild!.querySelector('[aria-hidden]')).toBeNull()
    expect(rail.textContent).toBe('MonitorMaintainImproveActivate')
    expect(rail.textContent).not.toMatch(/[\d·•|/]/)
  })

  it('lists the 13 capabilities in data order, after the rail', () => {
    const { rail, capabilities } = renderManaged()
    const items = within(capabilities).getAllByRole('listitem')

    expect(capabilities.tagName).toBe('UL')
    expect(items.map((item) => item.textContent)).toEqual(managedServices.capabilities)
    expect(items).toHaveLength(13)
    // The Reverse ETL capability, matched by pattern, as service wording
    // may only live in services.ts.
    expect(items.filter((item) => /^Reverse ETL .*activation$/.test(item.textContent!))).toHaveLength(1)
    for (const item of items) expect(item).toBeVisible()
    expectInOrder([rail, capabilities])
  })

  it('shows the journey as an ordered list of three steps, last in the panel', () => {
    const { panel, capabilities, journey } = renderManaged()
    const steps = within(journey).getAllByRole('listitem')

    expect(journey.tagName).toBe('OL')
    expect(steps).toHaveLength(3)
    expect(steps.map((step) => step.textContent)).toEqual(managedServices.journey)
    expect(panel.textContent).not.toMatch(/→/)
    expectInOrder([capabilities, journey])
    expect(panel.lastElementChild).toBe(journey)
  })

  it('has exactly three lists: the rail, the capabilities and the journey', () => {
    const { section } = renderManaged()

    expect(within(section).getAllByRole('list')).toHaveLength(3)
  })

  it('has no link, button, tab stop, stage label, tag or Fafanua Intelligence', () => {
    const { section } = renderManaged()

    expect(within(section).queryByRole('link')).toBeNull()
    expect(within(section).queryByRole('button')).toBeNull()
    expect(section.querySelector('a, button, input, [tabindex]')).toBeNull()
    for (const label of Object.values(stages)) {
      expect(within(section).queryByText(label)).toBeNull()
    }
    expect(section.textContent).not.toMatch(/fafanua intelligence/i)
    // Only the rail separators are hidden.
    expect(section.querySelectorAll('[aria-hidden]')).toHaveLength(3)
  })

  it('shows no other words', () => {
    const { section } = renderManaged()

    expect(section.textContent).toBe(
      [
        `02 — ${managedServices.sectionLabel}`,
        managedServices.sectionHeading,
        managedServices.eyebrow,
        managedServices.heading,
        managedServices.description,
        ...managedServices.rail,
        ...managedServices.capabilities,
        ...managedServices.journey,
      ].join(''),
    )
  })
})
