import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { services, stages, type Service } from '../data/services.ts'
import ServiceCard from './ServiceCard.tsx'

// The governance card has the longest engagements list (ten items).
const governance = services.find(
  (service) => service.id === 'data-governance-and-metadata',
)!

// The text a screen reader reads: the element's text without its
// aria-hidden parts.
function spokenText(element: Element) {
  const copy = element.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent
}

// The lifecycle line: the paragraph right after the title.
const lifecycleLine = () =>
  screen.getByRole('heading', { level: 3 }).nextElementSibling as HTMLElement

// The tag list: the card's one list that the button does not control.
const tagList = () =>
  screen
    .getAllByRole('list')
    .find((list) => !list.id) as HTMLElement

// The engagements panel, found by the id the button controls.
const panelOf = (button: HTMLElement) =>
  document.getElementById(button.getAttribute('aria-controls')!)!

function renderCard(service: Service = governance) {
  render(<ServiceCard service={service} />)
  return {
    heading: screen.getByRole('heading', { level: 3 }),
    button: screen.getByRole('button', {
      name: `Typical engagements for ${service.name}`,
    }),
  }
}

describe('ServiceCard', () => {
  it('shows the name, label, description, tags and button in that order', () => {
    const { heading, button } = renderCard()
    const label = lifecycleLine()
    const description = screen.getByText(governance.description)

    expect(heading).toHaveTextContent(governance.name)
    expect(spokenText(label)).toBe('Govern')
    expect(description.textContent).toBe(governance.description)
    const order = [heading, label, description, tagList(), button, panelOf(button)]
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it.each(services.map((service, index) => [service.stage, service, index]))(
    'shows the %s stage as visible text after a decorative marker and its hidden number',
    (_stage, service, index) => {
      renderCard(service)
      const label = lifecycleLine()
      const [marker, number] = label.querySelectorAll('[aria-hidden="true"]')
      const stageNumber = String(index + 1).padStart(2, '0')

      expect(label.tagName).toBe('P')
      // Seen as "01 Design", read as "Design".
      expect(label.textContent).toBe(`${stageNumber}${stages[service.stage]}`)
      expect(spokenText(label)).toBe(stages[service.stage])
      expect(marker).toBeEmptyDOMElement()
      expect(number).toHaveTextContent(stageNumber)
      expect(label.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
      expect(label.lastChild?.nodeType).toBe(Node.TEXT_NODE)
    },
  )

  it.each(services.map((service) => [service.name, service]))(
    'shows the tags for %s in order, outside the panel, while it is closed',
    (_name, service) => {
      const { button } = renderCard(service)
      const list = tagList()
      const items = within(list).getAllByRole('listitem')

      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(list.tagName).toBe('UL')
      expect(items.map((item) => item.textContent)).toEqual(service.tags)
      for (const item of items) expect(item).toBeVisible()
      expect(panelOf(button)).not.toContainElement(list)
      expect(list).not.toContainElement(button)
    },
  )

  it('gives the tags no links, buttons, names or tab stops', () => {
    renderCard()
    const list = tagList()

    expect(within(list).queryAllByRole('link')).toHaveLength(0)
    expect(within(list).queryAllByRole('button')).toHaveLength(0)
    expect(list.querySelector('a, button, [tabindex], [aria-label]')).toBeNull()
    expect(list).not.toHaveAttribute('aria-label')
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('adds no other headings', () => {
    renderCard()
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })

  it('starts collapsed, with the list hidden', () => {
    const { button } = renderCard()

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    // Only the tag list is shown.
    expect(screen.getAllByRole('list')).toEqual([tagList()])
    const panel = panelOf(button)
    expect(panel).toHaveAttribute('hidden')
    for (const item of governance.engagements) {
      expect(screen.queryByText(item)).not.toBeVisible()
    }
  })

  it('shows every engagement in order when opened, and hides them again', () => {
    const { button } = renderCard()

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const list = panelOf(button)
    expect(screen.getAllByRole('list')).toEqual([tagList(), list])
    expect(list).not.toHaveAttribute('hidden')
    const items = within(list).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(
      governance.engagements,
    )
    expect(items).toHaveLength(10)

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('list')).toEqual([tagList()])
  })

  it('marks the card as open while the list is shown', () => {
    const { heading, button } = renderCard()
    const card = heading.parentElement!

    expect(card).not.toHaveClass('service-card--open')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(card).toHaveClass('service-card--open')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(card).not.toHaveClass('service-card--open')
  })

  it('names the button with its visible text, then the service name', () => {
    const { button } = renderCard()

    expect(button).toHaveAccessibleName(
      `Typical engagements for ${governance.name}`,
    )
    expect(button).not.toHaveAttribute('aria-label')
  })

  it('builds ids from the service id', () => {
    const { heading, button } = renderCard()

    expect(heading).toHaveAttribute('id', `${governance.id}-heading`)
    expect(button).toHaveAttribute(
      'aria-controls',
      `${governance.id}-typical-engagements`,
    )
  })
})
