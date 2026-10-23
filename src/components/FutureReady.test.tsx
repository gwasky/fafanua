import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import {
  futureReadyConditions,
  futureReadyGoal,
  futureReadyHeading,
  futureReadyLead,
  futureReadyLinkText,
  futureReadyVerdictLine,
  futureReadyVerdicts,
} from '../data/futureReady.ts'
import FutureReady from './FutureReady.tsx'
import futureReadyCss from './FutureReady.css?raw'

// The section's copy is section C of the homepage sections refinement
// plan (#91), character for character; futureReady.plan.test.ts checks
// futureReady.ts against the plan, so these are the plan's strings. The
// keys are held in sentence case and shown in capitals by CSS.
const HEADING = 'Trusted foundations for what comes next'
const LEAD = 'AI and advanced analytics work only when four things are true.'
const TILES = [
  ['Business definitions', 'Metrics are clearly defined'],
  ['Lineage', 'Inputs can be traced to their source'],
  ['Quality signals', 'Data quality is known'],
  ['Access controls', 'Access is controlled'],
  ['What comes next', 'Advanced analytics & AI'],
]
const VERDICT_LINE =
  'The Data Trust Assessment gives you a plain verdict for each use case you are considering:'
const VERDICTS = ['Ready now', 'Ready after specific fixes', 'Not ready yet']
const LINK = 'See how the assessment works'

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

// The only places "AI" may appear: the lead's readiness framing and the
// goal tile, a readiness outcome (section C, #91).
const ALLOWED_AI_PHRASES = ['AI and advanced analytics', 'Advanced analytics & AI']

function renderFutureReady() {
  render(<FutureReady />)
  const section = screen.getByRole('region', { name: HEADING })
  const flow = within(section).getByRole('list', { name: HEADING })
  const chips = within(section).getByRole('list', { name: VERDICT_LINE })
  return { section, flow, chips }
}

// An element's text without its aria-hidden arrows.
function visibleText(element: Element): string {
  const copy = element.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove()
  return copy.textContent!
}

// Each text block on its own, in DOM order, so neighbouring blocks do not
// run together.
function blocks(section: HTMLElement): string[] {
  return [
    ...section.querySelectorAll(
      'h2, .future-ready__lead, .future-ready__key, .future-ready__condition, .future-ready__verdict-line, .future-ready__chips > li, a',
    ),
  ].map(visibleText)
}

describe('FutureReady', () => {
  it('is section#future-ready, a dark region named by its h2', () => {
    const { section } = renderFutureReady()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'future-ready')
    expect(section).toHaveAttribute('aria-labelledby', 'future-ready-heading')
    expect(heading).toHaveAttribute('id', 'future-ready-heading')
  })

  it('has exactly one heading, an h2 with the plan wording; the keys are not headings', () => {
    const { section } = renderFutureReady()
    const headings = within(section).getAllByRole('heading')

    expect(headings).toHaveLength(1)
    expect(headings[0].tagName).toBe('H2')
    expect(headings[0].textContent).toBe(HEADING)
    expect(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1)
  })

  it('holds the plan copy in DOM order, and nothing else', () => {
    const { section } = renderFutureReady()

    expect(blocks(section)).toEqual([
      HEADING,
      LEAD,
      ...TILES.flat(),
      VERDICT_LINE,
      ...VERDICTS,
      LINK,
    ])
    expect(visibleText(section)).toBe(
      [HEADING, LEAD, ...TILES.flat(), VERDICT_LINE, ...VERDICTS, LINK].join(''),
    )
  })

  it('reads its copy from futureReady.ts', () => {
    expect(futureReadyHeading).toBe(HEADING)
    expect(futureReadyLead).toBe(LEAD)
    expect([...futureReadyConditions, futureReadyGoal].map(({ key, text }) => [key, text])).toEqual(
      TILES,
    )
    expect(futureReadyVerdictLine).toBe(VERDICT_LINE)
    expect(futureReadyVerdicts).toEqual(VERDICTS)
    expect(futureReadyLinkText).toBe(LINK)
  })

  it('has one lead paragraph and the verdict line, the lead in the top row with the heading', () => {
    const { section } = renderFutureReady()
    const paragraphs = section.querySelectorAll('p')

    expect([...paragraphs].map((paragraph) => paragraph.textContent)).toEqual([LEAD, VERDICT_LINE])
    expect(paragraphs[0].parentElement).toBe(section.querySelector('h2')!.parentElement)
  })

  it('lists the four conditions then the goal in one ordered list of five, named by the heading', () => {
    const { flow } = renderFutureReady()
    const items = within(flow).getAllByRole('listitem')

    expect(flow.tagName).toBe('OL')
    expect(flow).toHaveAttribute('role', 'list')
    expect(flow).toHaveAttribute('aria-labelledby', 'future-ready-heading')
    expect(flow.children).toHaveLength(5)
    expect(items).toHaveLength(5)
    for (const child of flow.children) expect(child.tagName).toBe('LI')
    expect(items.map(visibleText)).toEqual(TILES.map(([key, text]) => key + text))
    // Key, then condition, in each item.
    items.forEach((item, index) => {
      expect(
        [...item.querySelectorAll('.future-ready__key, .future-ready__condition')].map(
          (element) => element.textContent,
        ),
      ).toEqual(TILES[index])
    })
    expect(items[4]).toHaveClass('future-ready__goal')
    expect(items[4].querySelector('.future-ready__tile--goal')).not.toBeNull()
  })

  it('puts the decorative arrow inside the goal item, before its tile, hidden', () => {
    const { flow } = renderFutureReady()
    const goal = flow.lastElementChild!
    const arrows = flow.querySelectorAll('.future-ready__arrow')

    expect(arrows).toHaveLength(1)
    expect(arrows[0].parentElement).toBe(goal)
    expect(arrows[0]).toHaveAttribute('aria-hidden', 'true')
    expect(arrows[0].textContent).toBe('→')
    expect(arrows[0].nextElementSibling).toHaveClass('future-ready__tile--goal')
    expect(arrows[0].tagName).not.toBe('LI')
  })

  it('lists the three verdicts as plain-text chips in a ul named by the verdict line', () => {
    const { section, chips } = renderFutureReady()
    const line = section.querySelector('.future-ready__verdict-line')!

    expect(chips.tagName).toBe('UL')
    expect(chips).toHaveAttribute('role', 'list')
    expect(chips).toHaveAttribute('aria-labelledby', line.id)
    expect(line.tagName).toBe('P')
    expect(line.id).toBe('future-ready-verdict-line')
    expect(within(chips).getAllByRole('listitem').map((item) => item.textContent)).toEqual(VERDICTS)
    for (const item of within(chips).getAllByRole('listitem')) {
      expect(item.children).toHaveLength(0)
    }
    expect(section.querySelectorAll('[aria-pressed], [aria-current]')).toHaveLength(0)
  })

  it('has exactly one tab stop, the link to the Data Trust Assessment', () => {
    const { section } = renderFutureReady()
    const links = within(section).getAllByRole('link')

    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '#data-trust-assessment')
    expect(links[0]).toHaveAccessibleName(LINK)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(
      section.querySelectorAll(
        'a, button, input, select, textarea, iframe, [tabindex], [contenteditable], summary',
      ),
    ).toEqual(section.querySelectorAll('a'))
  })

  it('puts the link\'s arrow in an aria-hidden element after its text', () => {
    const { section } = renderFutureReady()
    const link = within(section).getByRole('link')
    const arrow = link.querySelector('[aria-hidden="true"]')!

    expect(link.textContent).toBe(`${LINK}→`)
    expect(arrow.textContent).toBe('→')
    expect(link.lastElementChild).toBe(arrow)
  })

  it('uses plain ASCII text, with "→" only inside aria-hidden elements', () => {
    const { section } = renderFutureReady()

    expect(section.querySelector('br')).toBeNull()
    expect(section.textContent).not.toMatch(/\u00a0/)
    expect(section.innerHTML).not.toContain('&nbsp;')
    expect(visibleText(section)).toMatch(/^[\x20-\x7e]+$/)
    const hidden = [...section.querySelectorAll('[aria-hidden="true"]')].filter(
      (element) => !element.classList.contains('technical-grid'),
    )
    expect(hidden.map((element) => element.textContent)).toEqual(['→', '→'])
  })

  it('has exactly one technical grid, first, behind the content', () => {
    const { section } = renderFutureReady()
    const grids = section.querySelectorAll('.technical-grid')

    expect(grids).toHaveLength(1)
    expect(section.firstElementChild).toBe(grids[0])
    expect(grids[0]).toHaveAttribute('aria-hidden', 'true')
    expect(section.children).toHaveLength(2)
    expect(section.children[1]).toHaveClass('container')
  })

  it('has no images, icons or charts; its dots, rings and dashed border are CSS', () => {
    const { section } = renderFutureReady()

    expect(
      section.querySelectorAll('img, picture, svg, canvas, video, iframe, object'),
    ).toHaveLength(0)
    for (const element of section.querySelectorAll('.future-ready__key, .future-ready__chips > li')) {
      expect(element.children).toHaveLength(0)
    }
  })

  it('no longer uses the Intelligence colour', () => {
    expect(futureReadyCss).not.toContain('--service-intelligence')
  })

  it.each(FORBIDDEN)('does not say "%s"', (phrase) => {
    const { section } = renderFutureReady()
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
    const text = blocks(section).join(' ')

    expect(text).toBe(
      [HEADING, LEAD, ...TILES.flat(), VERDICT_LINE, ...VERDICTS, LINK].join(' '),
    )
    expect(text).not.toMatch(new RegExp(`\\b${escaped}\\b`, 'i'))
  })

  it('says "AI" only inside the two readiness phrases', () => {
    const { section } = renderFutureReady()
    const text = blocks(section).join(' ')
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

  it('keeps the SEO terms the old paragraph and list carried, as visible text', () => {
    const { section } = renderFutureReady()
    const text = blocks(section).join(' ').toLowerCase()

    for (const term of [
      'data quality',
      'lineage',
      'advanced analytics',
      'access controls',
      'business definitions',
      'quality signals',
      'data trust assessment',
    ]) {
      expect(text).toContain(term)
    }
  })

  it('uses .surface-dark and nests no .surface-alt inside it', () => {
    const { section } = renderFutureReady()

    expect(section).toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt')).toBeNull()
  })
})

describe('FutureReady in the page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function renderApp() {
    vi.stubGlobal('matchMedia', (media: string) => ({
      media,
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    render(<App />)
    const section = screen.getByRole('region', { name: HEADING })
    return { link: within(section).getByRole('link', { name: LINK }) }
  }

  it('links to the Data Trust Assessment section\'s existing id', () => {
    const { link } = renderApp()
    const target = document.getElementById('data-trust-assessment')

    expect(link.getAttribute('href')).toBe('#data-trust-assessment')
    expect(target).not.toBeNull()
    expect(target!.tagName).toBe('SECTION')
    expect(document.getElementById('assessment')).toBeNull()
  })

  it('moves focus to the assessment\'s heading after a plain click, with a temporary tabindex', async () => {
    const { link } = renderApp()
    const heading = document.getElementById('data-trust-assessment-heading')!

    fireEvent.click(link)
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(heading).toHaveAttribute('tabindex', '-1')
    link.focus()
    expect(heading).not.toHaveAttribute('tabindex')
  })

  it('leaves modified and non-primary clicks alone', async () => {
    const { link } = renderApp()
    const heading = document.getElementById('data-trust-assessment-heading')!

    for (const init of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      fireEvent.click(link, init)
    }
    // Longer than the frame and task a plain click waits for.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(document.activeElement).not.toBe(heading)
    expect(heading).not.toHaveAttribute('tabindex')
  })
})
