import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  assessmentAfter,
  assessmentDeliverables,
  assessmentLead,
  exampleMetrics,
  lineageExample,
} from '../data/assessment.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import TrustAssessment from './TrustAssessment.tsx'

// W4 in the trust and lineage plan (#71), character for character
// (assessment.plan.test.ts checks the data module against the plan).
const HEADING = 'Know where every number comes from.'
const CAPTION = 'Illustrative example. Sample data only.'
// The owner's metric names (#77), the five steps and the three ratings.
const METRICS = ['Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer']
const STEPS = ['Definition', 'Calculation', 'Source systems', 'Owner', 'Trust rating']
const RATINGS = ['Trusted', 'Trusted with caveats', 'Not yet trusted']
// The two list labels, proposed on #77 for the owner to confirm.
const METRICS_LABEL = 'Sample metrics'
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

  it('shows the lead, the four deliverables in order and the after-line, in reading order', () => {
    const { section } = renderSection()
    const [receive, after] = within(section).getAllByRole('heading', { level: 3 })
    const lead = within(section).getByText(assessmentLead)
    const list = receive.nextElementSibling as HTMLElement

    expect(lead.tagName).toBe('P')
    expect(lead.nextElementSibling).toBe(receive)
    expect(list.tagName).toBe('UL')
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'A lineage map showing how each key number is produced, system by system',
      'A trust scorecard rating each number as trusted, trusted with caveats, or not yet trusted, with the reasons',
      'Shared definitions for the terms your teams or branches use differently',
      'A prioritised fix list, ranked by impact and effort',
    ])
    expect(list.nextElementSibling).toBe(after)
    expect(after.nextElementSibling).toBe(within(section).getByText(assessmentAfter))
    expect(assessmentDeliverables).toHaveLength(4)
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
    // After the copy, before the example.
    expect(
      links[0].compareDocumentPosition(within(section).getByText(assessmentAfter)) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy()
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

  it('holds one figure, captioned "Illustrative example. Sample data only."', () => {
    const { section } = renderSection()
    const figures = within(section).getAllByRole('figure')
    const caption = figures[0].querySelector('figcaption')

    expect(figures).toHaveLength(1)
    expect(caption).not.toBeNull()
    expect(caption!.textContent).toBe(CAPTION)
    expect(figures[0]).toHaveAccessibleName(CAPTION)
  })

  it('lists the sample metrics, then the five steps, each list named by the label before it (#77)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const [caption, metricsLabel, metrics, stepsLabel, steps, ...rest] = [...figure.children]

    expect(rest).toEqual([])
    expect(caption.tagName).toBe('FIGCAPTION')
    // The labels are paragraphs, not headings.
    for (const [label, text] of [
      [metricsLabel, METRICS_LABEL],
      [stepsLabel, STEPS_LABEL],
    ] as const) {
      expect(label.tagName).toBe('P')
      expect(label.textContent).toBe(text)
      expect(label.id).not.toBe('')
    }
    expect(within(figure).queryAllByRole('heading')).toHaveLength(0)

    expect(metrics.tagName).toBe('UL')
    expect(metrics).toHaveAttribute('role', 'list')
    expect(metrics).toHaveAttribute('aria-labelledby', metricsLabel.id)
    expect(within(figure).getByRole('list', { name: METRICS_LABEL })).toBe(metrics)
    const metricItems = [...metrics.children]
    expect(metricItems.map((item) => item.tagName)).toEqual(METRICS.map(() => 'LI'))
    // Each metric is its name as text, and nothing else.
    expect(metricItems.map((item) => item.textContent)).toEqual(METRICS)
    for (const item of metricItems) expect(item.children).toHaveLength(0)

    expect(steps.tagName).toBe('OL')
    expect(steps).toHaveAttribute('role', 'list')
    expect(steps).toHaveAttribute('aria-labelledby', stepsLabel.id)
    expect(within(figure).getByRole('list', { name: STEPS_LABEL })).toBe(steps)
    const stepItems = [...steps.children]
    expect(stepItems.map((item) => item.tagName)).toEqual(STEPS.map(() => 'LI'))
    stepItems.forEach((item, index) => {
      const [label, ...after] = [...item.children]
      expect(label.tagName).toBe('P')
      expect(label.textContent).toBe(STEPS[index])
      // No value under any step; only the last holds the rating list.
      expect(after.map((child) => child.tagName)).toEqual(index === STEPS.length - 1 ? ['UL'] : [])
    })
  })

  it('lists the three rating categories inside the Trust rating step only, named by its label (#77)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const steps = within(figure).getByRole('list', { name: STEPS_LABEL })
    const lastStep = steps.lastElementChild!
    const ratings = within(figure).getByRole('list', { name: 'Trust rating' })
    const label = lastStep.firstElementChild!

    expect(ratings.parentElement).toBe(lastStep)
    expect(ratings.tagName).toBe('UL')
    expect(ratings).toHaveAttribute('role', 'list')
    expect(ratings).toHaveAttribute('aria-labelledby', label.id)
    expect(label.id).not.toBe('')
    expect(ratings.previousElementSibling).toBe(label)
    expect([...ratings.children].map((item) => [item.tagName, item.textContent, item.children.length])).toEqual(
      RATINGS.map((rating) => ['LI', rating, 0]),
    )
    // The only nested list in the figure.
    expect(figure.querySelectorAll('li ul, li ol')).toHaveLength(1)
    expect(figure.querySelectorAll('ul, ol')).toHaveLength(3)
  })

  it('gives no rating to any metric: the three look alike and none is marked (#77)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const items = [...within(figure).getByRole('list', { name: 'Trust rating' }).children]

    expect(new Set(items.map((item) => item.className)).size).toBe(1)
    expect(items[0].className).toBe('lineage-example__rating')
    for (const item of items) {
      expect(item.attributes).toHaveLength(1)
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

  it('holds exactly the caption, the two list labels, the metrics, the steps and the ratings, in order (#77)', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')

    expect(figure.textContent!.replace(/\s+/g, ' ').trim()).toBe(
      [CAPTION, METRICS_LABEL, ...METRICS, STEPS_LABEL, ...STEPS, ...RATINGS].join(''),
    )
  })

  it('shows the owner\'s metric names, the five steps and the three ratings, labels only (#77)', () => {
    expect(exampleMetrics).toEqual(METRICS)
    expect(lineageExample.metrics).toBe(exampleMetrics)
    expect(lineageExample.steps).toEqual(STEPS)
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
    expect(section.textContent).not.toMatch(/Fafanua Intelligence|\bAI\b|analytics/i)
  })

  it('is built from HTML only: no SVG, image, canvas or inline style', () => {
    const { section } = renderSection()

    expect(section.querySelectorAll('svg, img, picture, canvas, video, iframe, object')).toHaveLength(0)
    expect(section.querySelector('[style]')).toBeNull()
  })

  it('sits on the page background, with no eyebrow, technical grid or dark or alternate surface', () => {
    const { section } = renderSection()

    expect(section).not.toHaveClass('surface-alt')
    expect(section).not.toHaveClass('surface-dark')
    expect(section.querySelector('.surface-alt, .surface-dark, .technical-grid, .section-eyebrow')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = renderSection()

    await expectNoAxeViolations(container)
  })
})
