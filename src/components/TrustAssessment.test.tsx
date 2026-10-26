import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  assessmentDeliverables,
  assessmentLead,
  assessmentNextStatement,
  assessmentNextSupporting,
  lineageTrace,
} from '../data/assessment.ts'
import { expectNoAxeViolations } from '../test/axe.ts'
import TrustAssessment from './TrustAssessment.tsx'

// W4 in the trust and lineage plan (#71), the homepage enhancement plan
// (#79) and the dark panel plan (#82, revised for #99), character for
// character (assessment.plan.test.ts checks the data module against the
// plans).
const EYEBROW = 'Start with trust'
const NAME = 'Data Trust Assessment'
const HEADING = 'Know where every number comes from.'
const RECEIVE = 'What you receive'
// The closing strip (#82), with the statement of the revised plan (#99).
const NEXT_EYEBROW = 'What happens next'
const NEXT_STATEMENT = 'From findings to meaningful improvements.'
const NEXT_SUPPORTING =
  'The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your data foundation that need attention — from integration and modelling to quality, governance and analytics.'
// The four tiles (#99), each a label over its description.
const TILES = [
  ['Lineage map', 'See where each key number comes from and how it is produced.'],
  ['Trust scorecard', 'Know which figures are trusted, trusted with caveats, or not yet trusted.'],
  ['Shared definitions', 'Align the terms different teams or branches use differently.'],
  ['Prioritised roadmap', 'Know what to fix first, based on impact and effort.'],
]
// The card (#99): its heading, five steps, What we establish and the
// three ratings.
const CARD_HEADING = 'How we trace your numbers'
const STEPS = [
  ['Report', 'The leadership report where the number appears'],
  ['Definition', 'How the number is defined'],
  ['Calculation', 'The logic and rules that produce it'],
  ['Data model', 'The tables the calculation reads from'],
  ['Source system', 'Where the data is first recorded'],
]
const ESTABLISH_LABEL = 'What we establish'
const ESTABLISH = [
  ['Accountable owner', 'Who is responsible for the number'],
  ['Trust rating', 'How far the number can be trusted, and why'],
]
const RATING = 'Trust rating'
const RATINGS = ['Trusted', 'Trusted with caveats', 'Not yet trusted']
// Removed by the dark panel plan (#82) and its revision (#99).
const REMOVED = [
  'After the assessment',
  'The assessment tells us what to fix first.',
  'The findings become a prioritised roadmap.',
  'One role per metric',
  'Most organisations continue',
  '3 weeks',
  'fixed fee ',
  'Illustrative example',
  'Example leadership metrics',
  'Each traced through',
  'Who is accountable for the number',
  'Turn findings into a prioritised roadmap.',
  'Fix list',
  'A lineage map showing',
  'A trust scorecard rating',
  'Shared definitions for the terms',
  'A prioritised fix list',
]
const METRICS = ['Revenue', 'Active Customers', 'Portfolio at Risk', 'Programme Outcomes', 'Cost per Customer']

function renderSection() {
  const result = render(<TrustAssessment />)
  return { ...result, section: screen.getByRole('region', { name: HEADING }) }
}

/** The panel's three parts: the left column, the card and the strip. */
function parts(section: HTMLElement) {
  const panel = section.querySelector('.surface-dark')!
  const [intro, card, next, ...rest] = [...panel.children] as HTMLElement[]
  return { panel, intro, card, next, rest }
}

describe('TrustAssessment', () => {
  it('is section#data-trust-assessment, a region named by its h2, revealed as a section', () => {
    const { section } = renderSection()
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'data-trust-assessment')
    expect(heading).toHaveAttribute('id', 'data-trust-assessment-heading')
    expect(section).toHaveAttribute('aria-labelledby', 'data-trust-assessment-heading')
    expect(heading).toHaveTextContent(HEADING)
    expect(section).toHaveAttribute('data-reveal', 'section')
  })

  it('has the h2, then the card h3 How we trace your numbers and the closing h3 (#99)', () => {
    const { section } = renderSection()
    const headings = within(section).getAllByRole('heading')

    expect(headings.map((heading) => [heading.tagName, heading.textContent])).toEqual([
      ['H2', HEADING],
      ['H3', CARD_HEADING],
      ['H3', NEXT_STATEMENT],
    ])
  })

  it('holds one dark panel, the container\'s only child, in two parts: the left column and the card, then the closing strip (#99)', () => {
    const { section } = renderSection()
    const container = section.firstElementChild!
    const { panel, intro, card, next, rest } = parts(section)

    expect(section.children).toHaveLength(1)
    expect(container).toHaveClass('container')
    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild).toBe(panel)
    expect(panel.tagName).toBe('DIV')
    expect(panel).toHaveClass('surface-dark')
    expect(rest).toEqual([])
    expect(intro).toContainElement(within(section).getByRole('heading', { level: 2 }))
    expect(intro).toContainElement(within(section).getByRole('list', { name: RECEIVE }))
    expect(card).toHaveClass('surface-light')
    expect(card.firstElementChild).toBe(within(section).getByRole('heading', { name: CARD_HEADING }))
    expect(next.firstElementChild).toContainElement(within(section).getByRole('heading', { name: NEXT_STATEMENT }))
  })

  it('shows, in the left column, the eyebrow in its own row, the engagement name, the h2, the lead, the label and the tiles, in order (#99)', () => {
    const { section } = renderSection()
    const { intro } = parts(section)
    const [eyebrowRow, name, heading, lead, label, tiles, ...rest] = [...intro.children]
    const [eyebrow, ...more] = [...eyebrowRow.children]

    expect(rest).toEqual([])
    expect(more).toEqual([])
    expect(eyebrowRow.tagName).toBe('DIV')
    expect([eyebrow.tagName, eyebrow.textContent]).toEqual(['P', EYEBROW])
    expect(eyebrow).toHaveClass('section-eyebrow')
    expect([name.tagName, name.textContent]).toEqual(['P', NAME])
    expect(heading).toBe(within(section).getByRole('heading', { level: 2 }))
    expect([lead.tagName, lead.textContent]).toEqual(['P', assessmentLead])
    expect([label.tagName, label.textContent]).toEqual(['P', RECEIVE])
    expect(tiles.tagName).toBe('UL')
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
    // The strip is the panel's last part, and the button its last element:
    // nothing in the section follows it.
    expect(strip).toBe(section.querySelector('.surface-dark')!.lastElementChild)
    const all = [...section.querySelectorAll('*')]
    expect(all.slice(all.indexOf(link) + 1)).toEqual([link.lastElementChild])
    expect(assessmentNextStatement).toBe(NEXT_STATEMENT)
    expect(assessmentNextSupporting).toBe(NEXT_SUPPORTING)
  })

  it('no longer shows any removed string: the after-assessment block, the facts pill, the caption, the metrics, the trace label, the Owner step, the old sentences, Fix list or the old statement (#82, #99)', () => {
    const { section } = renderSection()

    for (const text of [...REMOVED, ...METRICS]) {
      expect(section.textContent, text).not.toContain(text)
    }
    expect(within(section).queryByRole('heading', { name: 'After the assessment' })).toBeNull()
    expect(within(section).queryByRole('heading', { name: RECEIVE })).toBeNull()
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
    // The eyebrow alone in its row, then the name, then the h2.
    expect(eyebrow.nextElementSibling).toBeNull()
    expect(eyebrow.parentElement!.nextElementSibling).toBe(name)
    expect(name.nextElementSibling).toBe(h2)
    expect(h2.textContent).toBe(HEADING)
    expect(section).toHaveAccessibleName(HEADING)
    expect(within(section).queryByRole('heading', { name: new RegExp(NAME, 'i') })).toBeNull()
  })

  it('shows the four deliverables in order as tiles, a list named by the What you receive label, each its label over its description (#99)', () => {
    const { section } = renderSection()
    const label = within(section).getByText(RECEIVE)
    const list = within(section).getByRole('list', { name: RECEIVE })

    expect(label.tagName).toBe('P')
    expect(label.id).not.toBe('')
    expect(label.nextElementSibling).toBe(list)
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('role', 'list')
    expect(list).toHaveAttribute('aria-labelledby', label.id)
    expect(list.nextElementSibling).toBeNull()
    const tiles = within(list).getAllByRole('listitem')
    expect(tiles.map((tile) => [...tile.children].map((child) => [child.tagName, child.textContent]))).toEqual(
      TILES.map(([name, description]) => [
        ['P', name],
        ['P', description],
      ]),
    )
    // The labels are not headings, and the colon is not shown.
    expect(within(list).queryAllByRole('heading')).toHaveLength(0)
    expect(list.textContent).not.toContain(':')
    expect(assessmentDeliverables.map((item) => [item.label, item.description])).toEqual(TILES)
  })

  it('shows exactly this text outside the card, in order (#99)', () => {
    const { section } = renderSection()
    const { card } = parts(section)
    const outside = [...section.querySelectorAll('*')]
      .filter((element) => !card.contains(element) && element.children.length === 0)
      .map((element) => element.textContent)

    expect(outside).toEqual([
      EYEBROW,
      NAME,
      HEADING,
      assessmentLead,
      RECEIVE,
      ...TILES.flat(),
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
    // After the closing paragraph and after the card.
    expect(
      links[0].compareDocumentPosition(within(section).getByText(assessmentNextSupporting)) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy()
    expect(links[0].compareDocumentPosition(parts(section).card) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
  })

  it('has no tab stop but the button, and nothing only shown on hover or focus', () => {
    const { section } = renderSection()
    const focusable = section.querySelectorAll(
      'a[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable], details',
    )

    expect([...focusable]).toEqual([within(section).getByRole('link')])
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    // The only hidden thing: the button's arrow (#99: no contour SVG).
    expect([...section.querySelectorAll('[hidden], [aria-hidden="true"]')]).toEqual([
      section.querySelector('.button__arrow'),
    ])
  })

  it('holds no figure or figcaption: the card is a div with no caption (#99)', () => {
    const { section } = renderSection()
    const { card } = parts(section)

    expect(within(section).queryAllByRole('figure')).toHaveLength(0)
    expect(section.querySelector('figure, figcaption')).toBeNull()
    expect(card.tagName).toBe('DIV')
    expect(card).not.toHaveAttribute('role')
    expect(card).not.toHaveAttribute('aria-labelledby')
  })

  it('shows, in the card, the h3, the five steps, What we establish and the ratings, in order (#99)', () => {
    const { section } = renderSection()
    const { card } = parts(section)
    const [heading, steps, establish, ratings, ...rest] = [...card.children]

    expect(rest).toEqual([])
    expect([heading.tagName, heading.textContent]).toEqual(['H3', CARD_HEADING])
    expect(steps.tagName).toBe('OL')
    expect(establish.tagName).toBe('DIV')
    const [label, list, ...more] = [...establish.children]
    expect(more).toEqual([])
    expect([label.tagName, label.textContent]).toEqual(['P', ESTABLISH_LABEL])
    expect(list.tagName).toBe('UL')
    expect(ratings.tagName).toBe('UL')
    expect(ratings).toBe(card.lastElementChild)
    // The card's only lists: the steps, the establish items and the
    // ratings.
    expect(card.querySelectorAll('ul, ol')).toHaveLength(3)
    expect(card.querySelector('dl, dt, dd')).toBeNull()
  })

  it('lists the five steps as an ol named by the card h3, each li its name and its description (#99)', () => {
    const { section } = renderSection()
    const heading = within(section).getByRole('heading', { name: CARD_HEADING })
    const steps = within(section).getByRole('list', { name: CARD_HEADING })

    expect(heading.id).not.toBe('')
    expect(steps.tagName).toBe('OL')
    expect(steps).toHaveAttribute('role', 'list')
    expect(steps).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading.nextElementSibling).toBe(steps)
    expect(
      [...steps.children].map((item) => [
        item.tagName,
        ...[...item.children].map((child) => [child.tagName, child.textContent, child.children.length]),
      ]),
    ).toEqual(
      STEPS.map(([name, description]) => [
        'LI',
        ['SPAN', name, 0],
        ['SPAN', description, 0],
      ]),
    )
  })

  it('reads each step as its name, a space and its description, by containment, not run together (#99)', () => {
    const { section } = renderSection()
    const steps = [...within(section).getByRole('list', { name: CARD_HEADING }).children]

    expect(steps.map((step) => step.textContent)).toEqual(STEPS.map(([name, description]) => `${name} ${description}`))
    for (const step of steps) {
      expect(step.querySelector('[aria-describedby], [aria-hidden], [role]')).toBeNull()
      expect(step.attributes).toHaveLength(1)
      expect(step).toHaveClass('lineage-trace__step')
    }
    expect(lineageTrace.steps.map((step) => [step.name, step.description])).toEqual(STEPS)
  })

  it('lists What we establish as a ul named by its label, each item its name over its description (#99)', () => {
    const { section } = renderSection()
    const label = within(section).getByText(ESTABLISH_LABEL)
    const list = within(section).getByRole('list', { name: ESTABLISH_LABEL })

    expect(label.tagName).toBe('P')
    expect(label.closest('h1, h2, h3, h4, h5, h6')).toBeNull()
    expect(list).toHaveAttribute('role', 'list')
    expect(list).toHaveAttribute('aria-labelledby', label.id)
    expect([...list.children].map((item) => [item.tagName, ...[...item.children].map((child) => [child.tagName, child.textContent])])).toEqual(
      ESTABLISH.map(([name, description]) => [
        'LI',
        ['P', name],
        ['P', description],
      ]),
    )
    expect(lineageTrace.establish.map((item) => [item.name, item.description])).toEqual(ESTABLISH)
  })

  it('names the ratings list by the Trust rating item\'s name (#99)', () => {
    const { section } = renderSection()
    const establish = within(section).getByRole('list', { name: ESTABLISH_LABEL })
    const ratingName = establish.lastElementChild!.firstElementChild!
    const ratings = within(section).getByRole('list', { name: RATING })

    expect(ratingName.textContent).toBe(RATING)
    expect(ratingName.id).not.toBe('')
    expect(ratings).toHaveAttribute('aria-labelledby', ratingName.id)
    expect(ratings).toHaveAttribute('role', 'list')
    expect(establish.contains(ratings)).toBe(false)
    expect([...ratings.children].map((item) => [item.tagName, item.textContent, item.children.length])).toEqual(
      RATINGS.map((text) => ['LI', text, 0]),
    )
  })

  it('gives no rating to any number: the three chips are bare list items, none marked (#77)', () => {
    const { section } = renderSection()
    const { card } = parts(section)
    const items = [...within(section).getByRole('list', { name: RATING }).children]

    for (const item of items) {
      // A bare list item: no class, role, ARIA state, tabindex or
      // aria-hidden, and only its text.
      expect(item.attributes).toHaveLength(0)
      expect(item.children).toHaveLength(0)
    }
    expect(
      card.querySelector('[aria-current], [aria-selected], [aria-checked], [aria-pressed], [tabindex], [aria-hidden], [role]:not(ul):not(ol)'),
    ).toBeNull()
    // No rating sits beside a step or an establish item.
    for (const list of [within(section).getByRole('list', { name: CARD_HEADING }), within(section).getByRole('list', { name: ESTABLISH_LABEL })]) {
      for (const rating of RATINGS) expect(within(list).queryByText(rating)).toBeNull()
    }
  })

  it('holds exactly the heading, the steps with their descriptions, the establish label and items and the ratings, in order (#99)', () => {
    const { section } = renderSection()
    const { card } = parts(section)
    const expected = [CARD_HEADING, ...STEPS.flat(), ESTABLISH_LABEL, ...ESTABLISH.flat(), ...RATINGS]
    const texts = [...card.querySelectorAll('*')]
      .filter((element) => element.children.length === 0)
      .map((element) => element.textContent)

    expect(texts).toEqual(expected)
  })

  it('shows no price, currency or figure anywhere: the section has no digit (#99)', () => {
    const { section } = renderSection()

    expect(section.textContent).not.toMatch(/\d|[$€£¥]|\b(UGX|USD|KES|TZS|RWF|EUR|GBP|shillings?|dollars?|price)\b/i)
    expect(section.textContent).toContain('three weeks at a fixed fee')
  })

  it('never calls the card a product, tool, dashboard, app, platform or live demo', () => {
    const { section } = renderSection()
    const { card } = parts(section)

    expect(section.textContent).not.toMatch(/\b(products?|tools?|dashboards?|apps?|platforms?|demos?)\b/i)
    // The card says nothing of AI or analytics. The section names no
    // Fafanua Intelligence or AI, and says "analytics" once, in the
    // closing paragraph (#82).
    expect(card.textContent).not.toMatch(/Fafanua Intelligence|\bAI\b|analytics/i)
    expect(section.textContent).not.toMatch(/Fafanua Intelligence|\bAI\b/i)
    expect(section.textContent!.match(/analytics/gi)).toHaveLength(1)
    const mentions = [...section.querySelectorAll('*')].filter(
      (element) => element.children.length === 0 && /analytics/i.test(element.textContent!),
    )
    expect(mentions).toEqual([within(section).getByText(NEXT_SUPPORTING)])
  })

  it('labels its steps with text only: the line, rings and dots are drawn in CSS, with no arrow characters (#79, #99)', () => {
    const { section } = renderSection()
    const { card } = parts(section)

    expect(card.textContent).not.toMatch(/[→↓←↑⟶⇣]/)
    expect(within(section).getByRole('list', { name: CARD_HEADING }).children).toHaveLength(5)
    expect(card.querySelectorAll('svg, img')).toHaveLength(0)
  })

  it('is built from HTML, with no inline SVG, image, canvas or inline style (#99)', () => {
    const { section } = renderSection()

    expect(section.querySelectorAll('svg')).toHaveLength(0)
    expect(section.querySelector('.trust-assessment__contours')).toBeNull()
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
    expect(light[0]).toBe(parts(section).card)
    expect(light[0].querySelector('.surface-dark, .surface-alt')).toBeNull()
    expect([...eyebrows].map((eyebrow) => eyebrow.textContent)).toEqual([EYEBROW, NEXT_EYEBROW])
    for (const eyebrow of eyebrows) expect(eyebrow.textContent).not.toMatch(/\d|—/)
  })

  it('shows the small labels What you receive and What we establish as paragraphs, not headings (#99)', () => {
    const { section } = renderSection()

    for (const text of [RECEIVE, ESTABLISH_LABEL]) {
      const label = within(section).getByText(text)
      expect(label.tagName).toBe('P')
      expect(label.closest('h1, h2, h3, h4, h5, h6, [role="heading"]')).toBeNull()
      expect(within(section).queryByRole('heading', { name: text })).toBeNull()
    }
  })

  it('reads the panel in order: left column, card, then the strip (#99)', () => {
    const { section } = renderSection()
    const order = [
      within(section).getByRole('heading', { level: 2 }),
      within(section).getByRole('list', { name: RECEIVE }),
      within(section).getByRole('heading', { name: CARD_HEADING }),
      within(section).getByRole('list', { name: CARD_HEADING }),
      within(section).getByRole('list', { name: ESTABLISH_LABEL }),
      within(section).getByRole('list', { name: RATING }),
      within(section).getByRole('heading', { name: NEXT_STATEMENT }),
      within(section).getByRole('link'),
    ]
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING, `${i}`).toBeTruthy()
    }
  })

  it('has no axe violations', async () => {
    const { container } = renderSection()

    await expectNoAxeViolations(container)
  })
})
