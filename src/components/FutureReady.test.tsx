import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FutureReady from './FutureReady.tsx'

// The heading is the owner's amended wording on #52, which plan V2 §14
// gives exactly. The paragraph and the four labels are W5 in the trust and
// lineage plan (#72), character for character.
const HEADING = 'Trusted foundations for what comes next'
const STATEMENT =
  'AI and advanced analytics work only when three things are true: metrics are clearly defined, inputs can be traced to their source, and data quality is known. The Data Trust Assessment gives you a plain verdict for each use case you are considering: ready now, ready after specific fixes, or not ready yet.'
const LABELS = [
  'business definitions',
  'access controls',
  'quality signals',
  'lineage',
]
// The final node's label, the refinement plan §9's preferred option (#63).
const DESTINATION = 'advanced analytics & AI'

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
  // Clinical AI is never mentioned (trust and lineage plan W5), and the
  // retired vocabulary (its section 6) is gone.
  'clinical',
  'diagnosis',
  'provenance',
  'data operating system',
]

// The only places "AI" may appear: the readiness framing of W5's
// paragraph (#72), and the final node's one label, a readiness
// destination (#63).
const ALLOWED_AI_PHRASES = ['AI and advanced analytics', 'advanced analytics & AI']

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

  it('contains only the heading, the paragraph, the four labels and the destination, nothing else', () => {
    const { section } = renderFutureReady()

    expect(section.textContent).toBe(HEADING + STATEMENT + LABELS.join('') + DESTINATION)
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

  it('exposes the graphic: a list named by the heading with the four labels in order, then the destination', () => {
    const { section, graphic } = renderFutureReady()
    const list = within(section).getByRole('list', { name: HEADING })

    // Only the technical grid behind the content is hidden now (#72).
    expect(section.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
    expect(section.querySelector('[aria-hidden="true"]')).toHaveClass('technical-grid')
    expect(graphic).not.toHaveAttribute('aria-hidden')
    expect(graphic).toContainElement(list)
    expect(list).toHaveAttribute('aria-labelledby', 'future-ready-heading')
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(LABELS)
    expect(within(section).getByText(DESTINATION)).toBeVisible()
    expect(graphic).not.toContainElement(
      within(section).getByRole('heading', { level: 2 }),
    )
    expect(graphic).not.toContainElement(section.querySelector('p'))
    expect(graphic.textContent).toBe(LABELS.join('') + DESTINATION)
  })

  it('draws its dots, rail and ring only with empty pseudo-elements, so nothing decorative is in the DOM', () => {
    const { graphic } = renderFutureReady()

    expect(graphic.querySelectorAll('*')).toHaveLength(LABELS.length + 2)
    for (const element of graphic.querySelectorAll('*')) {
      expect(element.textContent).not.toBe('')
    }
  })

  it('labels the final node "advanced analytics & AI", after the four foundations, not as a fifth', () => {
    const { graphic } = renderFutureReady()
    const end = graphic.lastElementChild!

    expect(end).toHaveClass('future-ready__end')
    expect(end.textContent).toBe(DESTINATION)
    expect(end.tagName).not.toBe('LI')
    expect(end.previousElementSibling!.tagName).toBe('UL')
    // No empty, unlabelled node is left.
    for (const element of graphic.querySelectorAll('*')) {
      if (element.children.length === 0) expect(element.textContent).not.toBe('')
    }
  })

  it('says "advanced analytics" in the paragraph that the destination repeats', () => {
    expect(STATEMENT).toContain('AI and advanced analytics')
  })

  it('has exactly one technical grid, first, behind the content', () => {
    const { section } = renderFutureReady()
    const grids = section.querySelectorAll('.technical-grid')

    expect(grids).toHaveLength(1)
    expect(section.firstElementChild).toBe(grids[0])
    expect(grids[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('no longer names the graphic\'s labels in the paragraph, so the graphic adds to it (#72)', () => {
    expect(STATEMENT).not.toContain('access controls')
    for (const label of LABELS) expect(STATEMENT).not.toContain(label)
  })

  it('names the Data Trust Assessment and its three verdicts in the paragraph', () => {
    expect(STATEMENT).toContain('The Data Trust Assessment')
    expect(STATEMENT).toContain('ready now, ready after specific fixes, or not ready yet')
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
    const text = [...section.querySelectorAll('h2, p, li, .future-ready__end')]
      .map((element) => element.textContent)
      .join(' ')

    expect(text).toBe(
      [HEADING, STATEMENT, ...LABELS, DESTINATION].join(' '),
    )
    expect(text).not.toMatch(new RegExp(`\\b${escaped}\\b`, 'i'))
  })

  it('says "AI" only inside the two readiness phrases', () => {
    const { section } = renderFutureReady()
    // Each block's text on its own, so the heading's last word and the
    // paragraph's first ("AI") do not run together.
    const text = [...section.querySelectorAll('h2, p, li, .future-ready__end')]
      .map((element) => element.textContent)
      .join(' ')
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
