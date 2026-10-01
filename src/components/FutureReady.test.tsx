import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FutureReady from './FutureReady.tsx'

// The heading is the owner's wording from decision 5 on #52. The paragraph
// is _docs/plan.md Section 9, verbatim, character for character.
const HEADING = 'Trusted foundations for what comes next'
const STATEMENT =
  'The strongest analytics and AI systems begin with trusted data. Fafanua designs data foundations that preserve business definitions, access controls, quality signals, and provenance as organisations introduce more advanced analytics and AI capabilities.'
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
  // AI capabilities from positioning Section 20 and owner decision 1.
  'Ready for AI',
  'machine learning',
  'predictive',
  'automation',
  'forecasting',
  'anomaly detection',
  'segmentation',
  'risk modelling',
  'churn',
  'document intelligence',
  'retrieval-augmented',
  'RAG',
  'generative',
  'AI-enabled',
  'AI applications',
  'chatbot',
  'LLM',
]

// The only places "AI" may appear: the readiness framing from plan Section 9.
const ALLOWED_AI_PHRASES = [
  'analytics and AI systems',
  'analytics and AI capabilities',
]

function renderFutureReady() {
  render(<FutureReady />)
  const section = screen.getByRole('region', { name: HEADING })
  const graphic = section.querySelector<HTMLElement>('.future-ready__graphic')!
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

  it('contains only the heading, the paragraph and the four labels, nothing else', () => {
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

    // The graphic and the technical grid behind the content.
    expect(section.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
    expect(graphic).toHaveAttribute('aria-hidden', 'true')
    expect(graphic).not.toContainElement(
      within(section).getByRole('heading', { level: 2 }),
    )
    expect(graphic).not.toContainElement(section.querySelector('p'))
    expect(
      [...graphic.querySelectorAll('li')].map((item) => item.textContent),
    ).toEqual(LABELS)
    expect(graphic.textContent).toBe(LABELS.join(''))
  })

  it('has exactly one technical grid, first, behind the content', () => {
    const { section } = renderFutureReady()
    const grids = section.querySelectorAll('.technical-grid')

    expect(grids).toHaveLength(1)
    expect(section.firstElementChild).toBe(grids[0])
    expect(grids[0]).toHaveAttribute('aria-hidden', 'true')
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

  it('says "AI" only inside the two readiness phrases from the plan', () => {
    const { section } = renderFutureReady()
    const text = section.textContent!
    const matches = [...text.matchAll(/\bAI\b/g)]

    expect(matches).toHaveLength(ALLOWED_AI_PHRASES.length)
    for (const match of matches) {
      const inAllowedPhrase = ALLOWED_AI_PHRASES.some((phrase) => {
        const start = text.indexOf(phrase)
        const offset = phrase.indexOf('AI')
        return start !== -1 && match.index === start + offset
      })
      expect(inAllowedPhrase).toBe(true)
    }
    for (const phrase of ALLOWED_AI_PHRASES) expect(text).toContain(phrase)
  })

  it('uses .surface-dark and nests no .surface-alt inside it', () => {
    const { section } = renderFutureReady()

    expect(section).toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt')).toBeNull()
  })
})
