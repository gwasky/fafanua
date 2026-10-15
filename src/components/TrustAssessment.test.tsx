import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  assessmentAfterStatement,
  assessmentAfterSupporting,
  assessmentDeliverableLabels,
  assessmentDeliverables,
  assessmentLead,
  exampleMetrics,
  lineageExample,
} from '../data/assessment.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import TrustAssessment from './TrustAssessment.tsx'

// W4 in the trust and lineage plan (#71) and the homepage enhancement
// plan (#79), character for character (assessment.plan.test.ts checks the
// data module against both plans).
const EYEBROW = 'Start with trust'
const NAME = 'Data Trust Assessment'
const HEADING = 'Know where every number comes from.'
const AFTER_STATEMENT = 'The assessment tells us what to fix first.'
const AFTER_SUPPORTING =
  'The findings become a prioritised roadmap. From there, Fafanua can strengthen the parts of your data foundation that need attention \u2014 from integration and modelling to quality, governance and analytics.'
const OLD_AFTER =
  'Most organisations continue with integration and modelling, quality and governance, or reporting built on the traced numbers.'
const CAPTION = 'Illustrative example'
// The owner's metric names (#77), the five trace steps and the footer's
// two labels, together the seven-step sequence (#79, laid out by W11 in
// #81), the owner role (W11) and the three ratings.
const METRICS = ['Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer']
const STEPS = ['Report', 'Definition', 'Calculation', 'Data model', 'Source system']
const OWNER = 'Owner'
const OWNER_ROLE = 'One role per metric'
const RATING = 'Trust rating'
const RATINGS = ['Trusted', 'Trusted with caveats', 'Not yet trusted']
// W11's tile labels (#81), each above its deliverable.
const TILE_LABELS = ['Lineage map', 'Trust scorecard', 'Shared definitions', 'Fix list']
const DELIVERABLES = [
  'A lineage map showing how each key number is produced, system by system',
  'A trust scorecard rating each number as trusted, trusted with caveats, or not yet trusted, with the reasons',
  'Shared definitions for the terms your teams or branches use differently',
  'A prioritised fix list, ranked by impact and effort',
]
// The two list labels: the enhancement plan §8's, and W4's concept that
// its §9 retains (#79).
const METRICS_LABEL = 'Example leadership metrics'
const STEPS_LABEL = 'Each traced through'

function renderSection() {
  const result = render(<TrustAssessment />)
  return { ...result, section: screen.getByRole('region', { name: HEADING }) }
}

describe('TrustAssessment', () => {
  it('is section#data-trust-assessment, a region named by its h2, revealed as a section', () => {
    const { section } = renderSection()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'data-trust-assessment')
    expect(section).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading).toHaveTextContent(HEADING)
    expect(section).toHaveAttribute('data-reveal', 'section')
  })

  it('has the h2, then the h3s What you receive and After the assessment', () => {
    const { section } = renderSection()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => [heading.tagName, heading.textContent])).toEqual([
      ['H2', HEADING],
      ['H3', 'What you receive'],
      ['H3', 'After the assessment'],
    ])
  })

  it('lays the section out in three rows, as siblings in the container: intro and card, tiles, band (#81)', () => {
    const { section } = renderSection()
    const container = section.firstElementChild!
    const [intro, figure, receive, band, ...rest] = [...container.children]

    expect(section.children).toHaveLength(1)
    expect(container).toHaveClass('container')
    expect(rest).toEqual([])
    expect(intro).toContainElement(within(section).getByRole('heading', { level: 2 }))
    expect(figure).toBe(within(section).getByRole('figure'))
    expect(receive.firstElementChild).toBe(within(section).getByRole('heading', { name: 'What you receive' }))
    expect(band.firstElementChild).toBe(within(section).getByRole('heading', { name: 'After the assessment' }))
  })

  it('shows the eyebrow and engagement name in one row, then the h2 and the lead, in the intro (#79, #81)', () => {
    const { section } = renderSection()
    const h2 = within(section).getByRole('heading', { level: 2 })
    const intro = h2.parentElement!
    const [labels, heading, lead, ...rest] = [...intro.children]
    const [eyebrow, name, ...more] = [...labels.children]

    expect(rest).toEqual([])
    expect(more).toEqual([])
    expect(intro).toBe(section.firstElementChild!.firstElementChild)
    expect([eyebrow.tagName, eyebrow.textContent]).toEqual(['P', EYEBROW])
    expect(eyebrow).toHaveClass('section-eyebrow')
    expect([name.tagName, name.textContent]).toEqual(['P', NAME])
    expect(heading).toBe(h2)
    expect([lead.tagName, lead.textContent]).toEqual(['P', assessmentLead])
  })

  it('shows the band\'s h3, statement, supporting copy and the button, in reading order, the button last in the section (#79, #81)', () => {
    const { section } = renderSection()
    const after = within(section).getByRole('heading', { name: 'After the assessment' })
    const band = after.parentElement!
    const [heading, statement, supporting, actions, ...rest] = [...band.children]
    const link = within(section).getByRole('link')

    expect(rest).toEqual([])
    expect(heading).toBe(after)
    expect([statement.tagName, statement.textContent]).toEqual(['P', AFTER_STATEMENT])
    expect([supporting.tagName, supporting.textContent]).toEqual(['P', AFTER_SUPPORTING])
    expect(actions.tagName).toBe('DIV')
    expect([...actions.children]).toEqual([link])
    // The band is the container's last row, and the button its last
    // element: nothing in the section follows it.
    expect(band).toBe(section.firstElementChild!.lastElementChild)
    const all = [...section.querySelectorAll('*')]
    expect(all.slice(all.indexOf(link) + 1)).toEqual([link.lastElementChild])
    expect(assessmentAfterStatement).toBe(AFTER_STATEMENT)
    expect(assessmentAfterSupporting).toBe(AFTER_SUPPORTING)
  })

  it('shows the eyebrow and engagement name as paragraphs above the h2, not headings and not in it, so the region keeps the h2\'s name (#79)', () => {
    const { section } = renderSection()
    const h2 = within(section).getByRole('heading', { level: 2 })
    const eyebrow = within(section).getByText(EYEBROW)
    const name = within(section).getByText(NAME)

    for (const label of [eyebrow, name]) {
      expect(label.tagName).toBe('P')
      expect(label.closest('h1, h2, h3, h4, h5, h6, [role="heading"]')).toBeNull()
      expect(h2.contains(label)).toBe(false)
      expect(label.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
    expect(eyebrow.nextElementSibling).toBe(name)
    expect(name.nextElementSibling).toBeNull()
    expect(name.parentElement!.nextElementSibling).toBe(h2)
    expect(h2.textContent).toBe(HEADING)
    expect(section).toHaveAccessibleName(HEADING)
    expect(within(section).queryByRole('heading', { name: new RegExp(NAME, 'i') })).toBeNull()
  })

  it('no longer shows the W4 after-line (#79)', () => {
    const { section } = renderSection()

    expect(section.textContent).not.toContain(OLD_AFTER)
    expect(section.textContent).not.toContain('Most organisations continue')
  })

  it('shows the four deliverables in order as tiles under What you receive, each with its W11 label above it (#81)', () => {
    const { section } = renderSection()
    const receive = within(section).getByRole('heading', { name: 'What you receive' })
    const list = receive.nextElementSibling as HTMLElement

    expect(receive.tagName).toBe('H3')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('role', 'list')
    expect(list.nextElementSibling).toBeNull()
    const tiles = within(list).getAllByRole('listitem')
    expect(tiles.map((tile) => [...tile.children].map((child) => [child.tagName, child.textContent]))).toEqual(
      TILE_LABELS.map((label, i) => [
        ['P', label],
        ['P', DELIVERABLES[i]],
      ]),
    )
    // The labels are not headings.
    expect(within(list).queryAllByRole('heading')).toHaveLength(0)
    expect(assessmentDeliverables).toEqual(DELIVERABLES)
    expect(assessmentDeliverableLabels).toEqual(TILE_LABELS)
  })

  it('adds only the four tile labels to the text outside the figure (#81)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const outside = [...section.querySelectorAll('*')]
      .filter((element) => !figure.contains(element) && element.children.length === 0)
      .map((element) => element.textContent)

    expect(outside).toEqual([
      EYEBROW,
      NAME,
      HEADING,
      assessmentLead,
      'What you receive',
      ...TILE_LABELS.flatMap((label, i) => [label, DELIVERABLES[i]]),
      'After the assessment',
      AFTER_STATEMENT,
      AFTER_SUPPORTING,
      '→',
    ])
  })

  it('has one link, the primary button "Book a data trust assessment" with a hidden arrow, to #contact', () => {
    const { section } = renderSection()
    const links = within(section).getAllByRole('link')

    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('Book a data trust assessment')
    expect(links[0]).toHaveAttribute('href', '#contact')
    expect(links[0]).toHaveClass('button')
    expect(links[0]).not.toHaveClass('button--secondary')
    expect(links[0].lastElementChild).toHaveTextContent('→')
    expect(links[0].lastElementChild).toHaveAttribute('aria-hidden', 'true')
    // After the supporting copy and after the example (#81).
    expect(
      links[0].compareDocumentPosition(within(section).getByText(assessmentAfterSupporting)) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy()
    expect(links[0].compareDocumentPosition(within(section).getByRole('figure')) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
  })

  it('has no tab stop but the button, and nothing only shown on hover or focus', () => {
    const { section } = renderSection()
    const focusable = section.querySelectorAll(
      'a[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable], details',
    )

    expect([...focusable]).toEqual([within(section).getByRole('link')])
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(section.querySelector('[hidden], [aria-hidden="true"]:not(.button__arrow)')).toBeNull()
  })

  it('holds one figure, captioned "Illustrative example" (#79)', () => {
    const { section } = renderSection()
    const figures = within(section).getAllByRole('figure')
    const caption = figures[0].querySelector('figcaption')

    expect(figures).toHaveLength(1)
    expect(caption).not.toBeNull()
    expect(caption!.textContent).toBe(CAPTION)
    expect(figures[0]).toHaveAccessibleName(CAPTION)
  })

  it('lists the example leadership metrics, then the trace of five steps, then the footer, each list named by the label before it (#77, #79, #81)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const [caption, metricsLabel, metrics, trace, footer, ...rest] = [...figure.children]

    expect(rest).toEqual([])
    expect(caption.tagName).toBe('FIGCAPTION')
    expect(within(figure).queryAllByRole('heading')).toHaveLength(0)

    expect([metricsLabel.tagName, metricsLabel.textContent]).toEqual(['P', METRICS_LABEL])
    expect(metricsLabel.id).not.toBe('')
    expect(metrics.tagName).toBe('UL')
    expect(metrics).toHaveAttribute('role', 'list')
    expect(metrics).toHaveAttribute('aria-labelledby', metricsLabel.id)
    expect(within(figure).getByRole('list', { name: METRICS_LABEL })).toBe(metrics)
    const metricItems = [...metrics.children]
    expect(metricItems.map((item) => item.tagName)).toEqual(METRICS.map(() => 'LI'))
    // Each metric is its name as text, and nothing else.
    expect(metricItems.map((item) => item.textContent)).toEqual(METRICS)
    for (const item of metricItems) expect(item.children).toHaveLength(0)

    // The trace: its label and the five-item ol, text only.
    const [stepsLabel, steps, ...traceRest] = [...trace.children]
    expect(traceRest).toEqual([])
    expect(trace.tagName).toBe('DIV')
    expect([stepsLabel.tagName, stepsLabel.textContent]).toEqual(['P', STEPS_LABEL])
    expect(stepsLabel.id).not.toBe('')
    expect(steps.tagName).toBe('OL')
    expect(steps).toHaveAttribute('role', 'list')
    expect(steps).toHaveAttribute('aria-labelledby', stepsLabel.id)
    expect(within(figure).getByRole('list', { name: STEPS_LABEL })).toBe(steps)
    expect([...steps.children].map((item) => [item.tagName, item.textContent, item.children.length])).toEqual(
      STEPS.map((step) => ['LI', step, 0]),
    )

    expect(footer.tagName).toBe('DL')
  })

  it('shows the footer as a definition list: Owner with its role, then Trust rating with the rating list it names (#77, #81)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const footer = figure.querySelector('dl')!
    const [owner, rating, ...rest] = [...footer.children]

    expect(footer).toBe(figure.lastElementChild)
    expect(rest).toEqual([])
    for (const group of [owner, rating]) {
      expect(group.tagName).toBe('DIV')
      expect([...group.children].map((child) => child.tagName)).toEqual(['DT', 'DD'])
    }
    expect([owner.children[0].textContent, owner.children[1].textContent]).toEqual([OWNER, OWNER_ROLE])
    expect(owner.children[1].children).toHaveLength(0)
    const [ratingTerm, ratingValue] = [...rating.children]
    expect(ratingTerm.textContent).toBe(RATING)
    expect(ratingTerm.id).not.toBe('')
    const ratings = within(figure).getByRole('list', { name: RATING })
    expect([...ratingValue.children]).toEqual([ratings])
    expect(ratings.tagName).toBe('UL')
    expect(ratings).toHaveAttribute('role', 'list')
    expect(ratings).toHaveAttribute('aria-labelledby', ratingTerm.id)
    expect([...ratings.children].map((item) => [item.tagName, item.textContent, item.children.length])).toEqual(
      RATINGS.map((text) => ['LI', text, 0]),
    )
    // The figure's only lists: the metrics, the steps and the ratings.
    expect(figure.querySelectorAll('ul, ol')).toHaveLength(3)
  })

  it('reads the steps, then Owner, then Trust rating: the seven-step sequence in DOM order (#79, #81)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const steps = [...within(figure).getByRole('list', { name: STEPS_LABEL }).children]
    const sequence = [...steps, ...figure.querySelectorAll('dt')]

    expect(sequence.map((element) => element.textContent)).toEqual([...STEPS, OWNER, RATING])
    sequence.slice(1).forEach((element, i) => {
      expect(sequence[i].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  it('shows the first metric, Revenue, as selected by CSS alone: no role, state, tab stop or hidden text (#81)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const chips = [...within(figure).getByRole('list', { name: METRICS_LABEL }).children]

    expect(chips[0].textContent).toBe(exampleMetrics[0])
    expect(exampleMetrics[0]).toBe('Revenue')
    for (const chip of chips) {
      // A bare list item: no class, role, ARIA state, tabindex or
      // aria-hidden, and only its text.
      expect(chip.attributes).toHaveLength(0)
      expect(chip.children).toHaveLength(0)
    }
    expect(
      figure.querySelector('[aria-current], [aria-selected], [aria-checked], [aria-pressed], [tabindex], [aria-hidden], [role]:not(ul):not(ol)'),
    ).toBeNull()
  })

  it('gives no rating to any metric: the three look alike and none is marked (#77)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const items = [...within(figure).getByRole('list', { name: 'Trust rating' }).children]

    // Alike in markup: their markers differ only by position, in CSS.
    for (const item of items) {
      expect(item.attributes).toHaveLength(0)
      expect(item).not.toHaveAttribute('aria-current')
      expect(item).not.toHaveAttribute('aria-selected')
      expect(item).not.toHaveAttribute('aria-checked')
    }
    expect(figure.querySelector('[aria-current], [aria-selected], [aria-checked]')).toBeNull()
    // No rating sits in the metrics list or beside a metric name.
    const metrics = within(figure).getByRole('list', { name: METRICS_LABEL })
    for (const rating of RATINGS) {
      expect(within(metrics).queryByText(rating)).toBeNull()
    }
    expect(metrics.contains(items[0])).toBe(false)
  })

  it('holds exactly the caption, the two list labels, the metrics, the steps, the footer and the ratings, in order (#77, #81)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const expected = [CAPTION, METRICS_LABEL, ...METRICS, STEPS_LABEL, ...STEPS, OWNER, OWNER_ROLE, RATING, ...RATINGS]
    const texts = [...figure.querySelectorAll('*')]
      .filter((element) => element.children.length === 0)
      .map((element) => element.textContent)

    expect(texts).toEqual(expected)
    expect(figure.textContent!.replace(/\s+/g, ' ').trim()).toBe(expected.join(''))
  })

  it('shows the owner\'s metric names, the five steps, the footer and the three ratings, labels only (#77, #79, #81)', () => {
    expect(exampleMetrics).toEqual(METRICS)
    expect(lineageExample.metrics).toBe(exampleMetrics)
    expect(lineageExample.steps).toEqual(STEPS)
    expect([lineageExample.ownerLabel, lineageExample.ownerRole, lineageExample.ratingLabel]).toEqual([OWNER, OWNER_ROLE, RATING])
    expect(lineageExample.ratings).toEqual(RATINGS)
    expect(lineageExample.metricsLabel).toBe(METRICS_LABEL)
    expect(lineageExample.stepsLabel).toBe(STEPS_LABEL)
  })

  it('shows no price, currency or figure anywhere', () => {
    const { section } = renderSection()

    expect(section.textContent).not.toMatch(/\d|[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?|price)\b/i)
  })

  it('never calls the example a product, tool, dashboard, app, platform or live demo', () => {
    const { section } = renderSection()

    expect(section.textContent).not.toMatch(/\b(products?|tools?|dashboards?|apps?|platforms?|demos?)\b/i)
    // The figure says nothing of AI or analytics. The section names no
    // Fafanua Intelligence or AI, and says "analytics" once, in the
    // owner's after-assessment supporting copy (#79).
    expect(within(section).getByRole('figure').textContent).not.toMatch(/Fafanua Intelligence|\bAI\b|analytics/i)
    expect(section.textContent).not.toMatch(/Fafanua Intelligence|\bAI\b/i)
    expect(section.textContent!.match(/analytics/gi)).toHaveLength(1)
    const mentions = [...section.querySelectorAll('*')].filter(
      (element) => element.children.length === 0 && /analytics/i.test(element.textContent!),
    )
    expect(mentions).toEqual([within(section).getByText(AFTER_SUPPORTING)])
  })

  it('labels its steps with text only: the rule and rings are drawn in CSS, with no arrow characters (#79, #81)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')

    expect(figure.textContent).not.toMatch(/[→↓←↑⟶⇣]/)
    expect(within(figure).getByRole('list', { name: STEPS_LABEL }).children).toHaveLength(5)
  })

  it('is built from HTML only: no SVG, image, canvas or inline style', () => {
    const { section } = renderSection()

    expect(section.querySelectorAll('svg, img, picture, canvas, video, iframe, object')).toHaveLength(0)
    expect(section.querySelector('[style]')).toBeNull()
  })

  it('sits on the page background, with one unnumbered eyebrow and no technical grid or dark or alternate surface (#79)', () => {
    const { section } = renderSection()
    const eyebrows = section.querySelectorAll('.section-eyebrow')

    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt, .surface-dark, .technical-grid')).toBeNull()
    expect(eyebrows).toHaveLength(1)
    expect(eyebrows[0].textContent).toBe(EYEBROW)
    expect(eyebrows[0].textContent).not.toMatch(/\d|—/)
  })

  it('has no axe violations', async () => {
    const { container } = renderSection()

    await expectNoAxeViolations(container)
  })
})
