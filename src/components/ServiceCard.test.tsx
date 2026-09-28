import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { serviceLines, services } from '../data/services.ts'
import ServiceCard from './ServiceCard.tsx'

// The governance card has the longest typical-work list (seven items).
const governance = services.find(
  (service) => service.id === 'data-governance-and-metadata',
)!

function renderCard(service = governance) {
  render(<ServiceCard service={service} />)
  return {
    heading: screen.getByRole('heading', { level: 3 }),
    button: screen.getByRole('button', {
      name: `Typical work for ${service.title}`,
    }),
  }
}

describe('ServiceCard', () => {
  it('shows the title, label, summary and button in that order', () => {
    const { heading, button } = renderCard()
    const label = screen.getByText(serviceLines[governance.serviceLine])
    const summary = screen.getByText(governance.summary)

    expect(heading).toHaveTextContent(governance.title)
    expect(summary.textContent).toBe(governance.summary)
    const order = [heading, label, summary, button]
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

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
    for (const item of governance.typicalWork) {
      expect(screen.queryByText(item)).not.toBeVisible()
    }
  })

  it('shows every typical-work item in order when opened, and hides them again', () => {
    const { button } = renderCard()

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('id', button.getAttribute('aria-controls'))
    expect(list).not.toHaveAttribute('hidden')
    const items = within(list).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(
      governance.typicalWork,
    )
    expect(items).toHaveLength(7)

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('names the button with its visible text, then the service title', () => {
    const { button } = renderCard()

    expect(button).toHaveAccessibleName(
      `Typical work for ${governance.title}`,
    )
    expect(button).not.toHaveAttribute('aria-label')
  })

  it('builds ids from the service id', () => {
    const { heading, button } = renderCard()

    expect(heading).toHaveAttribute('id', `${governance.id}-heading`)
    expect(button).toHaveAttribute(
      'aria-controls',
      `${governance.id}-typical-work`,
    )
  })
})
