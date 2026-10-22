import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { managedServices, stages } from '../data/services.ts'
import ManagedServices from './ManagedServices.tsx'

function renderManaged() {
  render(<ManagedServices />)
  const section = screen.getByRole('region', { name: managedServices.sectionHeading })
  const panel = section.querySelector<HTMLElement>('.surface-dark')!
  const nav = within(section).getByRole('navigation')
  const journey = within(nav).getByRole('list')
  const groups = [...panel.querySelectorAll<HTMLElement>('.managed-services__group')]
  const label = within(panel).getByText(managedServices.engagementLabel)
  const offers = panel.querySelector<HTMLElement>('.managed-services__offers')!
  return { section, panel, nav, journey, groups, label, offers }
}

// The two sections the journey links to, as fixtures: each named by its
// h2, as on the page.
function renderWithTargets() {
  render(
    <>
      <section id="data-trust-assessment" aria-labelledby="data-trust-assessment-heading">
        <h2 id="data-trust-assessment-heading">First target</h2>
      </section>
      <section id="capabilities" aria-labelledby="capabilities-heading">
        <h2 id="capabilities-heading">Second target</h2>
      </section>
      <ManagedServices />
    </>,
  )
  const nav = screen.getByRole('navigation', { name: managedServices.journeyLabel })
  const [first, second] = within(nav).getAllByRole('link')
  return {
    first,
    second,
    firstHeading: document.getElementById('data-trust-assessment-heading')!,
    secondHeading: document.getElementById('capabilities-heading')!,
  }
}

function expectInOrder(elements: HTMLElement[]) {
  for (let i = 1; i < elements.length; i++) {
    expect(
      elements[i - 1].compareDocumentPosition(elements[i]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  }
}

// An element's text without the aria-hidden arrows.
function visibleText(element: Element): string {
  const copy = element.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent!
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

  it('shows the eyebrow, journey, h2, description, link, groups, label and offers, in that order', () => {
    const { panel, nav, groups, label, offers } = renderManaged()
    const eyebrow = within(panel).getByText('02 — Managed Services')
    const h2 = within(panel).getByRole('heading', { level: 2 })
    const description = within(panel).getByText(managedServices.description)
    const link = within(panel).getByRole('link', { name: managedServices.heading })

    expect(eyebrow.tagName).toBe('P')
    expect(h2.textContent).toBe('Your data capability, continuously operated.')
    expect(description.tagName).toBe('P')
    expect(label.tagName).toBe('P')
    expectInOrder([eyebrow, nav, h2, description, link, ...groups, label, offers])
    // The eyebrow comes first.
    expect(panel.textContent!.startsWith('02 — Managed Services')).toBe(true)
  })

  it('shows the journey as an ordered list of three steps in a nav named by journeyLabel', () => {
    const { nav, journey } = renderManaged()
    const steps = within(journey).getAllByRole('listitem')

    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAccessibleName(managedServices.journeyLabel)
    expect(within(nav).getAllByRole('list')).toHaveLength(1)
    expect(journey.tagName).toBe('OL')
    expect(steps).toHaveLength(3)
    expect(steps.map(visibleText)).toEqual(managedServices.journey)
  })

  it('links the first two steps to the sections they name, and marks the last as the current step', () => {
    const { journey } = renderManaged()
    const steps = within(journey).getAllByRole('listitem')
    const links = within(journey).getAllByRole('link')

    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAccessibleName(managedServices.journey[0])
    expect(links[0]).toHaveAttribute('href', '#data-trust-assessment')
    expect(links[1]).toHaveAccessibleName(managedServices.journey[1])
    expect(links[1]).toHaveAttribute('href', '#capabilities')
    expect(within(steps[2]).queryByRole('link')).toBeNull()
    const current = steps[2].querySelector('[aria-current]')!
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(current.textContent).toBe(managedServices.journey[2])
    expect(journey.querySelectorAll('[aria-current]')).toHaveLength(1)
  })

  it('draws exactly two journey arrows, each aria-hidden after its link, and none after the current step', () => {
    const { journey } = renderManaged()
    const steps = within(journey).getAllByRole('listitem')
    const arrows = [...journey.querySelectorAll('[aria-hidden="true"]')]

    expect(arrows).toHaveLength(2)
    expect(journey.textContent!.match(/→/g)).toHaveLength(2)
    for (const [index, arrow] of arrows.entries()) {
      expect(arrow.textContent).toBe('→')
      expect(arrow.parentElement).toBe(steps[index])
      expect(arrow.previousElementSibling?.tagName).toBe('A')
    }
    expect(steps[2].textContent).not.toMatch(/→/)
  })

  it('has only the h2 and the four verb h3s, in that order', () => {
    const { section } = renderManaged()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => heading.tagName)).toEqual(['H2', 'H3', 'H3', 'H3', 'H3'])
    expect(headings.slice(1).map((heading) => heading.textContent)).toEqual(
      managedServices.groups.map((group) => group.heading),
    )
  })

  it('lists each group\'s services, in data order, in a list labelled by its h3', () => {
    const { groups } = renderManaged()

    expect(groups).toHaveLength(4)
    for (const [index, group] of groups.entries()) {
      const heading = within(group).getByRole('heading', { level: 3 })
      const list = within(group).getByRole('list')

      expect(heading.id).toBe(`managed-services-${managedServices.groups[index].heading.toLowerCase()}`)
      expect(list.tagName).toBe('UL')
      expect(list).toHaveAttribute('aria-labelledby', heading.id)
      expect(list).toHaveAccessibleName(managedServices.groups[index].heading)
      expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(
        managedServices.groups[index].services,
      )
    }
  })

  it('lists the offers in a list labelled by the engagement label, with no dot characters', () => {
    const { label, offers } = renderManaged()
    const items = within(offers).getAllByRole('listitem')

    expect(label.textContent).toBe(managedServices.engagementLabel)
    expect(label).toHaveAttribute('id', 'managed-services-engage-label')
    expect(offers.tagName).toBe('UL')
    expect(offers).toHaveAttribute('aria-labelledby', label.id)
    expect(offers).toHaveAccessibleName(managedServices.engagementLabel)
    expect(items.map((item) => item.textContent)).toEqual(managedServices.offers)
    expect(offers.textContent).not.toMatch(/[·•|]/)
  })

  it('renders each of the 13 capabilities exactly once', () => {
    const { panel, journey } = renderManaged()
    const items = [...panel.querySelectorAll('li')].filter(
      (item) => !journey.contains(item),
    )

    expect(managedServices.capabilities).toHaveLength(13)
    expect(items).toHaveLength(13)
    for (const capability of managedServices.capabilities) {
      expect(
        items.filter((item) => item.textContent === capability),
        capability,
      ).toHaveLength(1)
    }
    for (const item of items) expect(item).toBeVisible()
  })

  it('has three links, the two journey steps and the service link, and no button, tab stop, stage label or Fafanua Intelligence', () => {
    const { section } = renderManaged()
    const links = within(section).getAllByRole('link')

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#data-trust-assessment',
      '#capabilities',
      '/services/managed-data-analytics',
    ])
    const link = links[2]
    expect(link).toHaveAccessibleName(managedServices.heading)
    expect(link.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
    expect(link.querySelector('[aria-hidden="true"]')!.textContent).toBe('→')
    expect(link.closest('h1, h2, h3, h4, h5, h6')).toBeNull()
    expect(within(section).queryByRole('button')).toBeNull()
    expect(section.querySelector('button, input, [tabindex]')).toBeNull()
    for (const label of Object.values(stages)) {
      expect(within(section).queryByText(label)).toBeNull()
    }
    expect(section.textContent).not.toMatch(/fafanua intelligence/i)
    // Only the three arrows are hidden.
    const hidden = [...section.querySelectorAll('[aria-hidden]')]
    expect(hidden).toHaveLength(3)
    for (const arrow of hidden) expect(arrow.textContent).toBe('→')
  })

  it('no longer shows the old eyebrow or the rail of the four verbs', () => {
    const { section } = renderManaged()
    const verbs = ['Monitor', 'Maintain', 'Improve', 'Activate']

    expect(section.textContent).not.toMatch(/Need ongoing data capability\?/)
    for (const list of within(section).getAllByRole('list')) {
      const items = within(list).getAllByRole('listitem').map((item) => item.textContent)
      expect(items).not.toEqual(verbs)
    }
  })

  it('shows no other words', () => {
    const { section } = renderManaged()
    const { journey } = managedServices

    expect(section.textContent).toBe(
      [
        `02 — ${managedServices.sectionLabel}`,
        `${journey[0]}→`,
        `${journey[1]}→`,
        journey[2],
        managedServices.sectionHeading,
        managedServices.description,
        `${managedServices.heading}→`,
        ...managedServices.groups.flatMap((group) => [group.heading, ...group.services]),
        managedServices.engagementLabel,
        ...managedServices.offers,
      ].join(''),
    )
  })

  it('moves focus to the target section\'s heading on a plain click of a journey link', () => {
    const { first, second, firstHeading, secondHeading } = renderWithTargets()

    fireEvent.click(first)
    expect(document.activeElement).toBe(firstHeading)
    expect(firstHeading).toHaveAttribute('tabindex', '-1')

    fireEvent.click(second)
    expect(document.activeElement).toBe(secondHeading)
    // The first heading lost focus, so it no longer has a tabindex.
    expect(firstHeading).not.toHaveAttribute('tabindex')

    // A second click on the same link focuses again.
    fireEvent.click(second)
    expect(document.activeElement).toBe(secondHeading)
  })

  it('leaves focus alone on a modified or non-primary click', () => {
    const { first, firstHeading } = renderWithTargets()

    for (const init of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      fireEvent.click(first, init)
      expect(document.activeElement).not.toBe(firstHeading)
      expect(firstHeading).not.toHaveAttribute('tabindex')
    }
  })
})
