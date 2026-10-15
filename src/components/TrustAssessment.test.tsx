import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  assessmentDeliverableLabels,
  assessmentDeliverables,
  assessmentFacts,
  assessmentLead,
  assessmentNextStatement,
  assessmentNextSupporting,
  exampleMetrics,
  lineageExample,
} from '../data/assessment.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import TrustAssessment from './TrustAssessment.tsx'

// W4 in the trust and lineage plan (#71), the homepage enhancement plan
// (#79) and the dark panel plan (#82), character for character
// (assessment.plan.test.ts checks the data module against the plans).
const EYEBROW = 'Start with trust'
const NAME = 'Data Trust Assessment'
const HEADING = 'Know where every number comes from.'
const FACTS = '3 weeks \u00b7 fixed fee'
// The closing strip (#82), which replaces the after-assessment block.
const NEXT_EYEBROW = 'What happens next'
const NEXT_STATEMENT = 'Turn findings into a prioritised roadmap.'
const NEXT_SUPPORTING =
  'The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your data foundation that need attention \u2014 from integration and modelling to quality, governance and analytics.'
// Removed by the dark panel plan (#82).
const AFTER_HEADING = 'After the assessment'
const AFTER_STATEMENT = 'The assessment tells us what to fix first.'
const AFTER_SUPPORTING =
  'The findings become a prioritised roadmap. From there, Fafanua can strengthen the parts of your data foundation that need attention \u2014 from integration and modelling to quality, governance and analytics.'
const OLD_OWNER_ROLE = 'One role per metric'
const OLD_AFTER =
  'Most organisations continue with integration and modelling, quality and governance, or reporting built on the traced numbers.'
const CAPTION = 'Illustrative example'
// The owner's metric names (#77), the seven-step sequence (#79) with the
// dark panel plan's descriptions (#82), and the three ratings.
const METRICS = ['Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer']
const STEPS = ['Report', 'Definition', 'Calculation', 'Data model', 'Source system', 'Owner', 'Trust rating']
const DESCRIPTIONS = [
  'The leadership report where the number appears',
  'How the number is defined',
  'The logic and rules that produce it',
  'The tables the calculation reads from',
  'Where the data is first recorded',
  'Who is accountable for the number',
  'How far the number can be trusted, and why',
]
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

  it('has the h2, then the h3s What you receive and the closing statement (#82)', () => {
    const { section } = renderSection()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => [heading.tagName, heading.textContent])).toEqual([
      ['H2', HEADING],
      ['H3', 'What you receive'],
      ['H3', NEXT_STATEMENT],
    ])
  })

  it('holds one dark panel, the container\'s only child, laid out in rows: intro and card, tiles, closing strip (#82)', () => {
    const { section } = renderSection()
    const container = section.firstElementChild!
    const panel = container.firstElementChild!
    const [intro, figure, receive, next, ...rest] = [...panel.children]

    expect(section.children).toHaveLength(1)
    expect(container).toHaveClass('container')
    expect(container.children).toHaveLength(1)
    expect(panel.tagName).toBe('DIV')
    expect(panel).toHaveClass('surface-dark')
    expect(rest).toEqual([])
    expect(intro).toContainElement(within(section).getByRole('heading', { level: 2 }))
    expect(figure).toBe(within(section).getByRole('figure'))
    expect(receive.firstElementChild).toBe(within(section).getByRole('heading', { name: 'What you receive' }))
    expect(next.firstElementChild).toContainElement(within(section).getByRole('heading', { name: NEXT_STATEMENT }))
  })

  it('shows the eyebrow in its own row, then the engagement name, the h2, the lead, the facts pill and the contour lines, in the intro (#79, #82)', () => {
    const { section } = renderSection()
    const h2 = within(section).getByRole('heading', { level: 2 })
    const intro = h2.parentElement!
    const [eyebrowRow, name, heading, lead, facts, contours, ...rest] = [...intro.children]
    const [eyebrow, ...more] = [...eyebrowRow.children]

    expect(rest).toEqual([])
    expect(more).toEqual([])
    expect(intro).toBe(section.querySelector('.surface-dark')!.firstElementChild)
    expect(eyebrowRow.tagName).toBe('DIV')
    expect([eyebrow.tagName, eyebrow.textContent]).toEqual(['P', EYEBROW])
    expect(eyebrow).toHaveClass('section-eyebrow')
    expect([name.tagName, name.textContent]).toEqual(['P', NAME])
    expect(heading).toBe(h2)
    expect([lead.tagName, lead.textContent]).toEqual(['P', assessmentLead])
    expect([facts.tagName, facts.textContent]).toEqual(['P', FACTS])
    expect(assessmentFacts).toBe(FACTS)
    expect(contours.tagName.toLowerCase()).toBe('svg')
  })

  it('shows the closing strip\'s text group (eyebrow, h3, paragraph), then the button, in reading order, the button last in the section (#82)', () => {
    const { section } = renderSection()
    const statement = within(section).getByRole('heading', { name: NEXT_STATEMENT })
    const textGroup = statement.parentElement!
    const strip = textGroup.parentElement!
    const [eyebrow, heading, supporting, ...rest] = [...textGroup.children]
    const [group, actions, ...more] = [...strip.children]
    const link = within(section).getByRole('link')

    expect(rest).toEqual([])
    expect(more).toEqual([])
    expect(group).toBe(textGroup)
    expect(textGroup.tagName).toBe('DIV')
    expect([eyebrow.tagName, eyebrow.textContent]).toEqual(['P', NEXT_EYEBROW])
    expect(eyebrow).toHaveClass('section-eyebrow')
    expect(heading).toBe(statement)
    expect(heading.tagName).toBe('H3')
    expect([supporting.tagName, supporting.textContent]).toEqual(['P', NEXT_SUPPORTING])
    expect(actions.tagName).toBe('DIV')
    expect([...actions.children]).toEqual([link])
    // The strip is the panel's last row, and the button its last element:
    // nothing in the section follows it.
    expect(strip).toBe(section.querySelector('.surface-dark')!.lastElementChild)
    const all = [...section.querySelectorAll('*')]
    expect(all.slice(all.indexOf(link) + 1)).toEqual([link.lastElementChild])
    expect(assessmentNextStatement).toBe(NEXT_STATEMENT)
    expect(assessmentNextSupporting).toBe(NEXT_SUPPORTING)
  })

  it('no longer shows the after-assessment block or W11\'s owner row value (#82)', () => {
    const { section } = renderSection()

    for (const text of [AFTER_HEADING, AFTER_STATEMENT, AFTER_SUPPORTING, OLD_OWNER_ROLE]) {
      expect(section.textContent).not.toContain(text)
    }
    expect(within(section).queryByRole('heading', { name: AFTER_HEADING })).toBeNull()
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
    // The eyebrow alone in its row, then the name, then the h2 (#82).
    expect(eyebrow.nextElementSibling).toBeNull()
    expect(eyebrow.parentElement!.nextElementSibling).toBe(name)
    expect(name.nextElementSibling).toBe(h2)
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

  it('shows exactly this text outside the figure, in order (#81, #82)', () => {
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
      FACTS,
      // The contour lines' two paths: no text.
      '',
      '',
      'What you receive',
      ...TILE_LABELS.flatMap((label, i) => [label, DELIVERABLES[i]]),
      NEXT_EYEBROW,
      NEXT_STATEMENT,
      NEXT_SUPPORTING,
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
    // After the closing paragraph and after the example (#82).
    expect(
      links[0].compareDocumentPosition(within(section).getByText(assessmentNextSupporting)) &
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
    // The only hidden things: the arrow and the one decorative SVG (#82).
    expect([...section.querySelectorAll('[hidden], [aria-hidden="true"]:not(.button__arrow)')]).toEqual([
      section.querySelector('svg.trust-assessment__contours'),
    ])
    expect(section.querySelector('[hidden]')).toBeNull()
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

  it('lists the example leadership metrics, then the trace of seven steps, then the ratings, each list named by the label before it (#77, #79, #82)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const [caption, metricsLabel, metrics, trace, ratings, ...rest] = [...figure.children]

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

    // The trace: its label and the seven-item ol, each step its name and
    // then its description, text only.
    const [stepsLabel, steps, ...traceRest] = [...trace.children]
    expect(traceRest).toEqual([])
    expect(trace.tagName).toBe('DIV')
    expect([stepsLabel.tagName, stepsLabel.textContent]).toEqual(['P', STEPS_LABEL])
    expect(stepsLabel.id).not.toBe('')
    expect(steps.tagName).toBe('OL')
    expect(steps).toHaveAttribute('role', 'list')
    expect(steps).toHaveAttribute('aria-labelledby', stepsLabel.id)
    expect(within(figure).getByRole('list', { name: STEPS_LABEL })).toBe(steps)
    expect(
      [...steps.children].map((item) => [item.tagName, ...[...item.children].map((child) => [child.tagName, child.textContent, child.children.length])]),
    ).toEqual(
      STEPS.map((step, i) => [
        'LI',
        ['P', step, 0],
        ['P', DESCRIPTIONS[i], 0],
      ]),
    )

    // The ratings, after the trace and inside the figure, not the trace.
    expect(ratings.tagName).toBe('UL')
    expect(ratings).toBe(figure.lastElementChild)
  })

  it('names the ratings list by the Trust rating step, the last step\'s name (#82)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const steps = within(figure).getByRole('list', { name: STEPS_LABEL })
    const ratingName = steps.lastElementChild!.firstElementChild!
    const ratings = within(figure).getByRole('list', { name: RATING })

    expect(ratingName.textContent).toBe(RATING)
    expect(ratingName.id).not.toBe('')
    expect(ratings).toHaveAttribute('aria-labelledby', ratingName.id)
    expect(ratings).toHaveAttribute('role', 'list')
    expect(steps.contains(ratings)).toBe(false)
    expect([...ratings.children].map((item) => [item.tagName, item.textContent, item.children.length])).toEqual(
      RATINGS.map((text) => ['LI', text, 0]),
    )
    // The figure's only lists: the metrics, the steps and the ratings.
    expect(figure.querySelectorAll('ul, ol')).toHaveLength(3)
    expect(figure.querySelector('dl, dt, dd')).toBeNull()
  })

  it('reads the seven-step sequence in DOM order, each name with its description, the last two marked as attributes by class alone (#79, #82)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const steps = [...within(figure).getByRole('list', { name: STEPS_LABEL }).children]

    expect(steps.map((step) => step.textContent)).toEqual(STEPS.map((step, i) => `${step}${DESCRIPTIONS[i]}`))
    expect(steps.map((step) => step.classList.contains('lineage-example__step--attribute'))).toEqual([
      false,
      false,
      false,
      false,
      false,
      true,
      true,
    ])
    expect(lineageExample.steps.filter((step) => step.attribute).map((step) => step.name)).toEqual(['Owner', 'Trust rating'])
    // Nothing hidden or described apart: the description is read with its
    // step by containment.
    for (const step of steps) {
      expect(step.querySelector('[aria-describedby], [aria-hidden], [role]')).toBeNull()
    }
  })

  it('shows the five metrics alike, none selected: no class, role, state, tab stop or hidden text (#82)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const chips = [...within(figure).getByRole('list', { name: METRICS_LABEL }).children]

    expect(chips.map((chip) => chip.textContent)).toEqual([...exampleMetrics])
    expect(chips).toHaveLength(5)
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

  it('holds exactly the caption, the two list labels, the metrics, the steps with their descriptions and the ratings, in order (#77, #82)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const expected = [
      CAPTION,
      METRICS_LABEL,
      ...METRICS,
      STEPS_LABEL,
      ...STEPS.flatMap((step, i) => [step, DESCRIPTIONS[i]]),
      ...RATINGS,
    ]
    const texts = [...figure.querySelectorAll('*')]
      .filter((element) => element.children.length === 0)
      .map((element) => element.textContent)

    expect(texts).toEqual(expected)
    expect(figure.textContent!.replace(/\s+/g, ' ').trim()).toBe(expected.join(''))
  })

  it('shows the owner\'s metric names, the seven steps with their descriptions and the three ratings, labels only (#77, #79, #82)', () => {
    expect(exampleMetrics).toEqual(METRICS)
    expect(lineageExample.metrics).toBe(exampleMetrics)
    expect(lineageExample.steps.map((step) => step.name)).toEqual(STEPS)
    expect(lineageExample.steps.map((step) => step.description)).toEqual(DESCRIPTIONS)
    expect(lineageExample.ratings).toEqual(RATINGS)
    expect(lineageExample.metricsLabel).toBe(METRICS_LABEL)
    expect(lineageExample.stepsLabel).toBe(STEPS_LABEL)
  })

  it('shows no price, currency or figure anywhere, the facts pill\'s three weeks aside (#82)', () => {
    const { section } = renderSection()
    const facts = within(section).getByText(FACTS)
    const text = section.textContent!.replace(FACTS, '')

    expect(section.textContent!.split(FACTS)).toHaveLength(2)
    expect(text).not.toMatch(/\d|[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?|price)\b/i)
    expect(facts.textContent!.match(/\d/g)).toEqual(['3'])
    expect(facts.textContent).not.toMatch(/[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?|price)\b/i)
  })

  it('never calls the example a product, tool, dashboard, app, platform or live demo', () => {
    const { section } = renderSection()

    expect(section.textContent).not.toMatch(/\b(products?|tools?|dashboards?|apps?|platforms?|demos?)\b/i)
    // The figure says nothing of AI or analytics. The section names no
    // Fafanua Intelligence or AI, and says "analytics" once, in the
    // closing paragraph (#82).
    expect(within(section).getByRole('figure').textContent).not.toMatch(/Fafanua Intelligence|\bAI\b|analytics/i)
    expect(section.textContent).not.toMatch(/Fafanua Intelligence|\bAI\b/i)
    expect(section.textContent!.match(/analytics/gi)).toHaveLength(1)
    const mentions = [...section.querySelectorAll('*')].filter(
      (element) => element.children.length === 0 && /analytics/i.test(element.textContent!),
    )
    expect(mentions).toEqual([within(section).getByText(NEXT_SUPPORTING)])
  })

  it('labels its steps with text only: the line, rings and dots are drawn in CSS, with no arrow characters (#79, #82)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')

    expect(figure.textContent).not.toMatch(/[→↓←↑⟶⇣]/)
    expect(within(figure).getByRole('list', { name: STEPS_LABEL }).children).toHaveLength(7)
    expect(figure.querySelectorAll('svg, img')).toHaveLength(0)
  })

  it('is built from HTML, with one decorative SVG, the contour lines, as the intro\'s last child: no image, canvas or inline style (#82)', () => {
    const { section } = renderSection()
    const svgs = section.querySelectorAll('svg')
    const intro = within(section).getByRole('heading', { level: 2 }).parentElement!

    expect(svgs).toHaveLength(1)
    const [svg] = svgs
    expect(svg).toHaveClass('trust-assessment__contours')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg.querySelector('title, desc, text')).toBeNull()
    expect(svg.textContent).toBe('')
    expect(intro.lastElementChild).toBe(svg)
    const paths = [...svg.children]
    expect(paths.map((path) => path.tagName.toLowerCase())).toEqual(['path', 'path'])
    for (const path of paths) {
      expect(path).toHaveAttribute('fill', 'none')
      expect(path).toHaveAttribute('stroke', 'currentColor')
      expect(path).toHaveAttribute('vector-effect', 'non-scaling-stroke')
    }
    expect(section.querySelectorAll('img, picture, canvas, video, iframe, object, animate, animateTransform')).toHaveLength(0)
    expect(section.querySelector('[style]')).toBeNull()
  })

  it('sits on the page background, holding one dark panel and one light card, with two unnumbered eyebrows and no technical grid or alternate surface (#79, #82)', () => {
    const { section } = renderSection()
    const eyebrows = section.querySelectorAll('.section-eyebrow')
    const dark = section.querySelectorAll('.surface-dark')
    const light = section.querySelectorAll('.surface-light')

    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt, .technical-grid')).toBeNull()
    expect(dark).toHaveLength(1)
    expect(dark[0].parentElement).toBe(section.firstElementChild)
    expect(light).toHaveLength(1)
    expect(light[0]).toBe(within(section).getByRole('figure'))
    expect(light[0].querySelector('.surface-dark, .surface-alt')).toBeNull()
    expect([...eyebrows].map((eyebrow) => eyebrow.textContent)).toEqual([EYEBROW, NEXT_EYEBROW])
    for (const eyebrow of eyebrows) expect(eyebrow.textContent).not.toMatch(/\d|—/)
  })

  it('has no axe violations', async () => {
    const { container } = renderSection()

    await expectNoAxeViolations(container)
  })
})
