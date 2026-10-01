import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TechnicalGrid from './TechnicalGrid.tsx'

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]'

function renderGrid() {
  const { container } = render(<TechnicalGrid />)
  return { container, grid: container.firstElementChild as HTMLElement }
}

describe('TechnicalGrid', () => {
  it('is one empty div hidden from assistive technology', () => {
    const { container, grid } = renderGrid()

    expect(container.children).toHaveLength(1)
    expect(grid.tagName).toBe('DIV')
    expect(grid).toHaveAttribute('aria-hidden', 'true')
    expect(grid).toBeEmptyDOMElement()
  })

  it('has no accessible name, role or focusable content', () => {
    const { grid } = renderGrid()

    expect(grid).toHaveAccessibleName('')
    expect(grid).not.toHaveAttribute('role')
    expect(grid).not.toHaveAttribute('tabindex')
    expect(grid.matches(FOCUSABLE)).toBe(false)
    expect(grid.querySelectorAll(FOCUSABLE)).toHaveLength(0)
  })

  it('draws nothing with an image, SVG or canvas', () => {
    const { grid } = renderGrid()

    expect(grid.querySelectorAll('img, svg, canvas, picture')).toHaveLength(0)
    expect(grid).not.toHaveAttribute('style')
  })
})
