import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Positioning from './Positioning.tsx'

// The core message from the services-positioning doc, Section 1, and the
// statement #55 moved out of the hero.
const STATEMENT =
  'Fafanua helps organisations build reliable data foundations, connect fragmented systems, improve trust in their data, and turn information into useful business intelligence.'
const SUPPORT =
  'Fafanua helps East African businesses, government institutions and development organisations establish trusted data foundations for reliable reporting, better decisions and future governed analytics and AI.'

describe('Positioning', () => {
  it('shows the statement, then the supporting copy, each exactly, in two paragraphs', () => {
    const { container } = render(<Positioning />)
    const paragraphs = [...container.querySelectorAll('p')]

    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([
      STATEMENT,
      SUPPORT,
    ])
    expect(screen.getByText(STATEMENT)).toBe(paragraphs[0])
    expect(screen.getByText(SUPPORT)).toBe(paragraphs[1])
    expect(container.textContent).toBe(STATEMENT + SUPPORT)
  })

  it('has no heading, link or other focusable element', () => {
    const { container } = render(<Positioning />)

    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(container.querySelector('a, button, [tabindex]')).toBeNull()
  })

  it('is a plain div, not a named region or other landmark', () => {
    const { container } = render(<Positioning />)

    expect((container.firstElementChild as HTMLElement).tagName).toBe('DIV')
    for (const role of ['region', 'navigation', 'complementary', 'banner', 'contentinfo', 'main']) {
      expect(screen.queryAllByRole(role)).toHaveLength(0)
    }
    expect(container.querySelector('section, [aria-label], [aria-labelledby], [role]')).toBeNull()
  })
})
