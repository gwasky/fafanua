import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Positioning from './Positioning.tsx'

// The problem, the refinement plan §3's left column, character for
// character (positioning.plan.test.ts checks it against the plan), and
// Fafanua's response, its right column, which W3 in the trust and lineage
// plan removed because it restated the hero (#70). The eyebrow, framing
// and transition are the homepage enhancement plan's §5 and §6 (#79).
const EYEBROW = 'The problem'
const FRAMING =
  'Organisations rarely lack data. The challenge is knowing whether the numbers used to run the business are connected, consistent and trustworthy.'
const TRANSITION =
  'That is why Fafanua starts by tracing the numbers leadership relies on most back to their source.'
const STATEMENT =
  'Most organisations already have data, reporting and operational systems. The challenge is making the information flowing through them connected, consistent and trusted.'
const SUPPORT =
  'Fafanua helps organisations build and strengthen the foundations underneath reporting, analytics and operations \u2014 from integration and modelling to quality, governance and ongoing platform support.'

describe('Positioning', () => {
  it('shows the eyebrow, framing, problem and transition exactly, as its four paragraphs, in order (#79)', () => {
    const { container } = render(<Positioning />)
    const paragraphs = [...container.querySelectorAll('p')]

    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([
      EYEBROW,
      FRAMING,
      STATEMENT,
      TRANSITION,
    ])
    expect(screen.getByText(STATEMENT)).toBe(paragraphs[2])
    expect(paragraphs[2]).toHaveClass('positioning__statement')
    expect(container.textContent).toBe([EYEBROW, FRAMING, STATEMENT, TRANSITION].join(''))
    // Nothing else holds text: every element is a paragraph or a wrapper.
    for (const element of container.querySelectorAll('*')) {
      expect(['DIV', 'P']).toContain(element.tagName)
    }
  })

  it('shows THE PROBLEM as an unnumbered section eyebrow, a paragraph, first (#79)', () => {
    const { container } = render(<Positioning />)
    const eyebrows = container.querySelectorAll('.section-eyebrow')

    expect(eyebrows).toHaveLength(1)
    expect(eyebrows[0].tagName).toBe('P')
    expect(eyebrows[0].textContent).toBe(EYEBROW)
    expect(eyebrows[0].textContent).not.toMatch(/\d|—/)
    expect(container.querySelector('p')).toBe(eyebrows[0])
  })

  it('puts the eyebrow and framing in one column, then the statement and transition in the other (#79)', () => {
    const { container } = render(<Positioning />)
    const [eyebrow, framing, statement, transition] = [...container.querySelectorAll('p')]

    expect(eyebrow.parentElement).toBe(framing.parentElement)
    expect(statement.parentElement).toBe(transition.parentElement)
    expect(framing.parentElement).not.toBe(statement.parentElement)
    expect(framing.parentElement!.nextElementSibling).toBe(statement.parentElement)
    expect(eyebrow.nextElementSibling).toBe(framing)
    expect(statement.nextElementSibling).toBe(transition)
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
