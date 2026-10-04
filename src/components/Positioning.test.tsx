import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Positioning from './Positioning.tsx'

const STATEMENT =
  'Fafanua helps East African businesses, government institutions and development organisations establish trusted data foundations for reliable reporting, better decisions and future governed analytics and AI.'

describe('Positioning', () => {
  it('shows the positioning statement exactly, in one paragraph', () => {
    const { container } = render(<Positioning />)
    const statement = screen.getByText(STATEMENT)

    expect(statement.tagName).toBe('P')
    expect(statement.textContent).toBe(STATEMENT)
    expect(container.querySelectorAll('p')).toHaveLength(1)
    expect(container.textContent).toBe(STATEMENT)
  })

  it('has no heading or link', () => {
    render(<Positioning />)

    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('is not a named region or other landmark', () => {
    const { container } = render(<Positioning />)

    for (const role of ['region', 'navigation', 'complementary', 'banner', 'contentinfo', 'main']) {
      expect(screen.queryAllByRole(role)).toHaveLength(0)
    }
    expect(container.querySelector('section, [aria-label], [aria-labelledby]')).toBeNull()
  })
})
