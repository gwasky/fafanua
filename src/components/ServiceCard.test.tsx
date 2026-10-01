import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { services, stages, type Service } from '../data/services.ts'
import ServiceCard from './ServiceCard.tsx'

// The governance card has the longest engagements list (ten items).
const governance = services.find(
  (service) => service.id === 'data-governance-and-metadata',
)!

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
  it('shows the name, label, description and button in that order', () => {
    const { heading, button } = renderCard()
    const label = screen.getByText(stages[governance.stage])
    const description = screen.getByText(governance.description)

    expect(heading).toHaveTextContent(governance.name)
    expect(label).toHaveTextContent('Govern')
    expect(description.textContent).toBe(governance.description)
    const order = [heading, label, description, button]
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it.each(services.map((service) => [service.stage, service]))(
    'shows the %s stage as visible text beside a decorative marker',
    (_stage, service) => {
      renderCard(service)
      const label = screen.getByText(stages[service.stage])
      const marker = label.querySelector('[aria-hidden="true"]')

      expect(label.tagName).toBe('P')
      expect(label.textContent).toBe(stages[service.stage])
      expect(marker).not.toBeNull()
      expect(marker).toBeEmptyDOMElement()
    },
  )

  it('adds no other headings', () => {
    renderCard()
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })

  it('starts collapsed, with the list hidden', () => {
    const { button } = renderCard()

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    const panel = document.getElementById(
      button.getAttribute('aria-controls')!,
    )
    expect(panel).toHaveAttribute('hidden')
    for (const item of governance.engagements) {
      expect(screen.queryByText(item)).not.toBeVisible()
    }
  })

  it('shows every engagement in order when opened, and hides them again', () => {
    const { button } = renderCard()

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('id', button.getAttribute('aria-controls'))
    expect(list).not.toHaveAttribute('hidden')
    const items = within(list).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(
      governance.engagements,
    )
    expect(items).toHaveLength(10)

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
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
