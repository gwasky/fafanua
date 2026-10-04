import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { services, stages } from '../data/services.ts'
import LifecycleRail from './LifecycleRail.tsx'

function renderRail() {
  render(<LifecycleRail />)
  const rail = screen.getByRole('list')
  return { rail, items: within(rail).getAllByRole('listitem') }
}

// The text a screen reader reads: the element's text without its
// aria-hidden parts.
function spokenText(element: Element) {
  const copy = element.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent
}

describe('LifecycleRail', () => {
  it('is one ordered list of six stages', () => {
    const { rail, items } = renderRail()

    expect(rail.tagName).toBe('OL')
    expect(rail).toHaveAttribute('role', 'list')
    expect(items).toHaveLength(6)
  })

  it('shows 01 Design to 06 Decide, in services order, from the stage labels', () => {
    const { items } = renderRail()

    expect(items.map((item) => item.textContent)).toEqual([
      '01Design',
      '02Connect',
      '03Model',
      '04Trust',
      '05Govern',
      '06Decide',
    ])
    expect(items.map(spokenText)).toEqual(
      services.map((service) => stages[service.stage]),
    )
  })

  it('hides each number and marker from screen readers, so each item reads as its label', () => {
    const { items } = renderRail()

    items.forEach((item, index) => {
      const hidden = item.querySelectorAll('[aria-hidden="true"]')
      expect(hidden).toHaveLength(2)
      expect(hidden[0]).toBeEmptyDOMElement()
      expect(hidden[1]).toHaveTextContent(String(index + 1).padStart(2, '0'))
      expect(screen.getByText(spokenText(item)!)).toBeVisible()
    })
  })

  it('has no link, button, heading, name or tab stop', () => {
    const { rail } = renderRail()

    expect(within(rail).queryAllByRole('link')).toHaveLength(0)
    expect(within(rail).queryAllByRole('button')).toHaveLength(0)
    expect(within(rail).queryAllByRole('heading')).toHaveLength(0)
    expect(rail.querySelector('a, button, [tabindex], [aria-label], [aria-labelledby]')).toBeNull()
    expect(rail).not.toHaveAttribute('aria-label')
  })
})
