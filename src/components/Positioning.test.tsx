import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Positioning from './Positioning.tsx'

// The problem, the refinement plan §3's left column, character for
// character (positioning.plan.test.ts checks it against the plan), and
// Fafanua's response, its right column, which W3 in the trust and lineage
// plan removed because it restated the hero (#70).
const STATEMENT =
  'Most organisations already have data, reporting and operational systems. The challenge is making the information flowing through them connected, consistent and trusted.'
const SUPPORT =
  'Fafanua helps organisations build and strengthen the foundations underneath reporting, analytics and operations \u2014 from integration and modelling to quality, governance and ongoing platform support.'

describe('Positioning', () => {
  it('shows the problem exactly, as its one paragraph', () => {
    const { container } = render(<Positioning />)
    const paragraphs = [...container.querySelectorAll('p')]

    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([STATEMENT])
    expect(screen.getByText(STATEMENT)).toBe(paragraphs[0])
    expect(paragraphs[0]).toHaveClass('positioning__statement')
    expect(container.textContent).toBe(STATEMENT)
  })

  it('no longer shows the response, which restated the hero (#70)', () => {
    const { container } = render(<Positioning />)

    expect(screen.queryByText(SUPPORT)).toBeNull()
    expect(container.textContent).not.toContain('Fafanua helps organisations')
    expect(container.querySelector('.positioning__support')).toBeNull()
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

  it('no longer shows the two paragraphs the refinement replaced', () => {
    const { container } = render(<Positioning />)

    expect(container.textContent).not.toContain('build reliable data foundations')
    expect(container.textContent).not.toContain('East African')
  })
})
