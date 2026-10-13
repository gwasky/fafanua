import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  assessmentAfter,
  assessmentDeliverables,
  assessmentLead,
  lineageExample,
} from '../data/assessment.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import TrustAssessment from './TrustAssessment.tsx'

// W4 in the trust and lineage plan (#71), character for character
// (assessment.plan.test.ts checks the data module against the plan).
const HEADING = 'Know where every number comes from.'
const CAPTION = 'Illustrative example. Sample data only.'
const FIGURE = 'Monthly revenue by branch'
const STEPS = ['Definition', 'Calculation', 'Source systems', 'Owner', 'Trust rating']

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

  it('traces "Monthly revenue by branch" through five labelled steps, each label then its value, in order', () => {
    const { section } = renderSection()
    const figure = within(section).getByRole('figure')
    const steps = within(figure).getByRole('list', { name: FIGURE })
    const items = within(steps).getAllByRole('listitem')

    expect(steps.tagName).toBe('OL')
    expect(within(figure).getByText(FIGURE).tagName).toBe('P')
    expect(items).toHaveLength(5)
    items.forEach((item, index) => {
      const [label, value, ...rest] = [...item.children]
      const step = lineageExample.steps[index]
      expect(label.textContent).toBe(STEPS[index])
      expect(value.textContent).toBe(step.value)
      expect(rest.map((child) => child.textContent)).toEqual(step.reason ? [step.reason] : [])
    })
  })

  it('gives the trust rating in text, one of the scorecard\'s three ratings, with its reason', () => {
    const { section } = renderSection()
    const items = within(within(section).getByRole('figure')).getAllByRole('listitem')
    const rating = items[4]

    expect(rating.children[1].textContent).toBe('Trusted with caveats')
    expect(rating.children[2].textContent).toBe(
      'Two branches record refunds a day late, so month-end totals can differ from the ledger.',
    )
  })

  it('shows the proposed sample values (#71; the owner confirms them)', () => {
    expect(lineageExample.steps.map((step) => step.value)).toEqual([
      'Invoiced revenue for each branch in the calendar month, net of refunds and discounts.',
      'Invoice totals minus refunds, summed by branch and month.',
      'Billing system, then the finance ledger.',
      'Head of finance',
      'Trusted with caveats',
    ])
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
