import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Positioning from './Positioning.tsx'

// The problem, the refinement plan §3's left column, character for
// character (positioning.plan.test.ts checks it against the plan), and
// Fafanua's response, its right column, which W3 in the trust and lineage
// plan removed because it restated the hero (#70). The eyebrow, framing
// and transition (the bridge line) are the homepage enhancement plan's §5
// and §6 (#79). W10 (#80) sets the statement's two sentences in two tones.
const EYEBROW = 'The problem'
const FRAMING =
  'Organisations rarely lack data. The challenge is knowing whether the numbers used to run the business are connected, consistent and trustworthy.'
const TRANSITION =
  'That is why Fafanua starts by tracing the numbers leadership relies on most back to their source.'
const LEAD = 'Most organisations already have data, reporting and operational systems.'
const CHALLENGE =
  'The challenge is making the information flowing through them connected, consistent and trusted.'
const STATEMENT =
  'Most organisations already have data, reporting and operational systems. The challenge is making the information flowing through them connected, consistent and trusted.'
const SUPPORT =
  'Fafanua helps organisations build and strengthen the foundations underneath reporting, analytics and operations \u2014 from integration and modelling to quality, governance and ongoing platform support.'

describe('Positioning', () => {
  it('shows the eyebrow, problem, framing and transition exactly, as its four paragraphs, in order (#80)', () => {
    const { container } = render(<Positioning />)
    const paragraphs = [...container.querySelectorAll('p')]

    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([
      EYEBROW,
      STATEMENT,
      FRAMING,
      TRANSITION,
    ])
    expect(paragraphs[1]).toHaveClass('positioning__statement')
    expect(container.textContent).toBe([EYEBROW, STATEMENT, FRAMING, TRANSITION].join(''))
    // Nothing else holds text: every element is a paragraph or a wrapper,
    // or one of the statement's two spans.
    for (const element of container.querySelectorAll('*')) {
      expect(['DIV', 'P', 'SPAN']).toContain(element.tagName)
      if (element.tagName === 'SPAN') expect(element.parentElement).toBe(paragraphs[1])
    }
    // No image of any kind and no background image.
    expect(container.querySelector('img, picture, svg, canvas, video, [style]')).toBeNull()
  })

  it('sets the statement as one paragraph of two spans, its two sentences, one space apart (#80)', () => {
    const { container } = render(<Positioning />)
    const statement = container.querySelector('.positioning__statement')!
    const [lead, challenge] = [...statement.children]

    expect(statement.tagName).toBe('P')
    expect(statement.children).toHaveLength(2)
    expect(lead.tagName).toBe('SPAN')
    expect(challenge.tagName).toBe('SPAN')
    expect(lead.textContent).toBe(LEAD)
    expect(challenge.textContent).toBe(CHALLENGE)
    expect([...statement.childNodes].map((node) => node.textContent)).toEqual([LEAD, ' ', CHALLENGE])
    expect(statement.textContent).toBe(STATEMENT)
    // Read as one statement: the paragraph alone holds it whole.
    expect(
      screen.getByText((_content, element) => element?.textContent === STATEMENT && element.tagName === 'P'),
    ).toBe(statement)
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

  it('puts the eyebrow, then the statement, then a row of the framing then the transition (#80)', () => {
    const { container } = render(<Positioning />)
    const [eyebrow, statement, framing, transition] = [...container.querySelectorAll('p')]
    const layout = eyebrow.parentElement!
    const row = framing.parentElement!

    expect([...layout.children]).toEqual([eyebrow, statement, row])
    expect(statement.parentElement).toBe(layout)
    expect(row.tagName).toBe('DIV')
    expect(row).not.toBe(layout)
    expect([...row.children]).toEqual([framing, transition])
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
