import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FutureReady from './FutureReady.tsx'

// Plan Section 9, character for character.
const HEADING = 'The strongest analytics and AI systems begin with trusted data.'
const STATEMENT =
  'Fafanua designs data foundations that preserve business definitions, access controls, quality signals, and provenance as organisations introduce more advanced analytics and AI capabilities.'
const LABELS = [
  'business definitions',
  'access controls',
  'quality signals',
  'provenance',
]

// Words and phrases that would present Fafanua Intelligence, or any AI or
// SaaS feature, as something that exists today.
const FORBIDDEN = [
  'Fafanua Intelligence',
  'Intelligence',
  'product',
  'platform',
  'launch',
  'coming soon',
  'now available',
  'available',
  'beta',
  'preview',
  'early access',
  'sign up',
  'demo',
  'try',
  'SaaS',
  'powered',
  'AI-driven',
  'AI-powered',
]

function renderFutureReady() {
  render(<FutureReady />)
  const section = screen.getByRole('region', { name: HEADING })
  const graphic = section.querySelector<HTMLElement>('[aria-hidden="true"]')!
  return { section, graphic }
}

describe('FutureReady', () => {
  it('is section#future-ready, a region named by its h2', () => {
    const { section } = renderFutureReady()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'future-ready')
    expect(section).toHaveAttribute('aria-labelledby', 'future-ready-heading')
    expect(heading).toHaveAttribute('id', 'future-ready-heading')
  })

  it('has exactly one heading, an h2 with the plan wording', () => {
    const { section } = renderFutureReady()
    const headings = within(section).getAllByRole('heading')

    expect(headings).toHaveLength(1)
    expect(headings[0].tagName).toBe('H2')
    expect(headings[0].textContent).toBe(HEADING)
    expect(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1)
  })

  it('has one paragraph with the plan wording', () => {
    const { section } = renderFutureReady()
    const paragraphs = section.querySelectorAll('p')

    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].textContent).toBe(STATEMENT)
  })

  it('uses plain ASCII text with no manual line breaks or non-breaking spaces', () => {
    const { section } = renderFutureReady()

    expect(section.querySelector('br')).toBeNull()
    expect(section.textContent).not.toMatch(/\u00a0/)
    expect(section.textContent).toMatch(/^[\x20-\x7e]+$/)
    expect(section.innerHTML).not.toContain('&nbsp;')
  })

  it('contains only the two sentences and the four labels, nothing else', () => {
    const { section } = renderFutureReady()

    expect(section.textContent).toBe(HEADING + STATEMENT + LABELS.join(''))
  })

  it('contains no links, buttons, form controls or other tab stops', () => {
    const { section } = renderFutureReady()

    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(
      section.querySelectorAll(
        'a, button, input, select, textarea, iframe, [tabindex], [contenteditable], summary',
      ),
    ).toHaveLength(0)
  })

  it('hides the graphic from screen readers and lists the four labels in order', () => {
    const { section, graphic } = renderFutureReady()

    expect(section.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
    expect(graphic).not.toContainElement(
      within(section).getByRole('heading', { level: 2 }),
    )
    expect(graphic).not.toContainElement(section.querySelector('p'))
    expect(
      [...graphic.querySelectorAll('li')].map((item) => item.textContent),
    ).toEqual(LABELS)
    expect(graphic.textContent).toBe(LABELS.join(''))
  })

  it('takes each graphic label word for word from the paragraph', () => {
    for (const label of LABELS) expect(STATEMENT).toContain(label)
  })

  it('has no images, icons or charts', () => {
    const { section } = renderFutureReady()

    expect(
      section.querySelectorAll('img, picture, svg, canvas, video, iframe, object'),
    ).toHaveLength(0)
  })

  it.each(FORBIDDEN)('does not say "%s"', (phrase) => {
    const { section } = renderFutureReady()
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')

    expect(section.textContent).not.toMatch(new RegExp(`\\b${escaped}\\b`, 'i'))
  })

  it('uses .surface-dark and nests no .surface-alt inside it', () => {
    const { section } = renderFutureReady()

    expect(section).toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt')).toBeNull()
  })
})
