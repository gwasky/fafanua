// Checks the Retail & Distribution page's entry in solutionPages.ts
// against section 4 of
// _docs/fafanua-retail-distribution-landing-page-plan.md (issue 101), so
// its wording cannot drift from the plan: every string character for
// character, the labels the plan writes in capitals compared in upper
// case (CSS shows them so), the "; ", " / " and "Name: text" splits, the
// diagram's solid and dashed sources (plan section 5), the segment cards,
// the stock journey, the figure's accessible description (plan section
// 6), and the recommended title and description and the proposed A1 to
// A3, pending the owner's decision. It also checks the plan's metadata
// conflicts, the section 7 terms, that the old Retail & Distribution
// strings are gone from src/, the naming and claims rules (plan section
// 3) without naming anyone, that the assessment claims no implementation
// work, and that the call to action and address come from contact.ts.
import { describe, expect, it } from 'vitest'
import {
  buttonLabel,
  cell,
  COMPLIANCE_TERMS,
  DASHED_SOURCES,
  DESCRIPTION,
  figureDescription,
  handlingItems,
  HIGHLIGHT_NOTE,
  list,
  marked,
  named,
  NAMING_TERMS,
  PROPOSED,
  SECTION_7_TERMS,
  segment,
  SOLID_SOURCES,
  tables,
  TITLE,
} from '../test/retailDistributionPlan.ts'
import { ctaLabel, email } from './contact.ts'
import { solutionPages, type SectorLandingPage } from './solutionPages.ts'
import { solutions } from './solutions.ts'

const entry = solutionPages['retail-and-distribution']
if (entry.layout !== 'sector') throw new Error('Retail & Distribution is not on the shared foundation')
const page: SectorLandingPage = entry
const journey = page.journey!
const segments = page.audience.segments!
const upper = (text: string) => text.toUpperCase()

// The page's visible strings: every string in the entry except the
// metadata, the figure's hidden description and the data's own keys.
const visible = () => {
  const strings: string[] = []
  const walk = (value: unknown, key = '') => {
    if (typeof value === 'string') {
      if (!['layout', 'icon', 'marker', 'service', 'statusIcon', 'calloutAlign'].includes(key)) strings.push(value)
    } else if (Array.isArray(value)) value.forEach((item) => walk(item, key))
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, k)
  }
  walk({ ...page, title: undefined, description: undefined, diagram: { ...page.diagram, description: undefined } })
  return strings
}

describe('Retail & Distribution plan section 4 parser', () => {
  it('finds the ten copy tables and the removed list in order', () => {
    expect([...tables.keys()]).toEqual([
      'Hero',
      'Trace diagram',
      'Challenge and approach',
      'Who we work with',
      'The Data Trust Assessment',
      'One stock figure',
      'Readiness and responsible handling',
      'What happens next',
      'Closing panel',
      'Metadata',
      'Removed from the current Retail & Distribution page',
    ])
  })
})

describe('Retail & Distribution metadata (plan section 4, owner note 1)', () => {
  it('records the plan\'s title and description, which break the length rules', () => {
    const title = cell('Metadata', 'Page title')
    const description = cell('Metadata', 'Meta description')
    expect(title).toBe('Retail analytics in Uganda: sales, stock and margin you can trace · Fafanua')
    expect(title).toHaveLength(75)
    expect(title).not.toMatch(/ \| Fafanua$/)
    expect(description).toHaveLength(212)
  })

  it('has the issue\'s recommended title and description, pending the owner, within the rules and with the plan\'s keywords', () => {
    expect(page.title).toBe(TITLE)
    expect(page.description).toBe(DESCRIPTION)
    expect(page.title).toHaveLength(56)
    expect(page.description).toHaveLength(151)
    expect(page.title).toMatch(/ \| Fafanua$/)
    expect(page.title).toContain('Retail Analytics Uganda')
    for (const keyword of ['Retail business intelligence', 'sales analytics', 'inventory analytics', 'distribution analytics', 'Uganda and East Africa']) {
      expect(page.description).toContain(keyword)
    }
    // The plan's description with only the audience list taken out.
    expect(cell('Metadata', 'Meta description').replace(' for retailers, wholesalers, distributors and FMCG businesses', '')).toBe(
      page.description,
    )
    expect(`${page.title} ${page.description}`).not.toMatch(/\bAI\b/)
    expect(`${page.title} ${page.description}`).not.toMatch(COMPLIANCE_TERMS)
  })
})

describe('Retail & Distribution copy (plan section 4)', () => {
  it('uses the hero\'s breadcrumb, eyebrow, heading, both leads and buttons', () => {
    expect(cell('Hero', 'Breadcrumb').split(' › ')).toEqual(['Home', 'Solutions', page.breadcrumb])
    expect(page.breadcrumb).toBe('Retail & distribution')
    expect(upper(page.hero.eyebrow)).toBe(cell('Hero', 'Eyebrow'))
    expect(page.hero.eyebrow).toBe('Retail and distribution solutions')
    expect(page.hero.heading).toBe(cell('Hero', 'Heading (`h1`)'))
    expect(page.hero.lead).toBe(cell('Hero', 'Lead, paragraph 1'))
    expect(page.hero.leadDetail).toBe(cell('Hero', 'Lead, paragraph 2'))
    expect(page.hero.lead).toContain('Uganda and East Africa')
    expect(buttonLabel(cell('Hero', 'Primary button'))).toBe(ctaLabel)
    expect(cell('Hero', 'Primary button')).toContain(`\`mailto:${email}\``)
    expect(page.hero.secondaryLabel).toBe(buttonLabel(cell('Hero', 'Secondary button')))
  })

  it('uses the trace diagram\'s headings, sources, steps, figures, ratings and caption', () => {
    const d = page.diagram
    expect(d.sourcesHeading).toBe(cell('Trace diagram', 'Left column heading'))
    expect(d.sources.map((source) => source.label)).toEqual(list(cell('Trace diagram', 'Sources, in order')))
    expect(d.traceHeading).toBe(cell('Trace diagram', 'Middle box heading'))
    expect(d.steps).toEqual(list(cell('Trace diagram', 'Middle steps')))
    expect(d.traceFootnote).toBe(cell('Trace diagram', 'Middle footnote'))
    expect(d.figuresHeading).toBe(cell('Trace diagram', 'Right column heading'))
    expect(d.figures).toEqual(
      list(cell('Trace diagram', 'Figures and ratings')).map(marked).map(({ name, rating, marker }) => ({ name, rating, marker })),
    )
    expect(d.figures.map((figure) => figure.marker)).toEqual(['teal', 'amber', 'hollow'])
    expect(d.caption).toBe(cell('Trace diagram', 'Caption'))
    expect(d.description).toBe(figureDescription)
    expect(d.description).toBe(
      'Illustrative example: sales by outlet, gross margin by product and stock accuracy traced to point-of-sale, inventory and finance systems, with trust ratings.',
    )
  })

  it('feeds the figures from the three sources plan section 5 draws solid, with its icons', () => {
    expect(SOLID_SOURCES).toEqual(['Point of sale', 'Inventory & warehouse', 'Finance ledger'])
    expect(DASHED_SOURCES).toEqual(['Loyalty & CRM', 'Distribution & delivery'])
    expect(page.diagram.sources.filter((source) => source.feeds).map((source) => source.label)).toEqual(SOLID_SOURCES)
    expect(page.diagram.sources.filter((source) => !source.feeds).map((source) => source.label)).toEqual(DASHED_SOURCES)
    expect(page.diagram.sources.map((source) => [source.label, source.icon, source.feeds])).toEqual([
      ['Loyalty & CRM', 'list', false],
      ['Distribution & delivery', 'truck', false],
      ['Point of sale', 'card', true],
      ['Inventory & warehouse', 'box', true],
      ['Finance ledger', 'ledger', true],
    ])
  })

  it('uses the challenge and approach cards, with no label or detail', () => {
    const t = 'Challenge and approach'
    expect(page.challenge.heading).toBe(cell(t, 'Card 1 heading'))
    expect(page.challenge.text).toBe(cell(t, 'Card 1 text'))
    expect(page.approach.heading).toBe(cell(t, 'Card 2 heading'))
    expect(page.approach.text).toBe(cell(t, 'Card 2 text'))
    for (const card of [page.challenge, page.approach]) {
      expect(card.label).toBeUndefined()
      expect(card.detail).toBeUndefined()
    }
    expect([page.challenge.icon, page.approach.icon]).toEqual(['alert', 'check'])
  })

  it('uses Who we work with: its subheading and three segment cards, each "name / description / item; item; item", with no single card', () => {
    const t = 'Who we work with'
    expect(page.audience.heading).toBe(cell(t, 'Heading'))
    expect(page.audience.subheading).toBe(cell(t, 'Subheading'))
    expect(page.audience.card).toBeUndefined()
    expect(segments).toHaveLength(3)
    expect(segments.map(({ heading, text, items }) => ({ heading, text, items }))).toEqual(
      [1, 2, 3].map((n) => segment(cell(t, `Segment ${n}`))),
    )
    for (const item of segments) expect(item.items).toHaveLength(3)
    expect(segments.map((item) => item.icon)).toEqual(['card', 'truck', 'box'])
  })

  it('uses the Data Trust Assessment\'s eyebrow, heading, text and deliverables (no full stops, no label, no Fix list)', () => {
    const t = 'The Data Trust Assessment'
    expect(upper(page.assessment.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(page.assessment.heading).toBe(cell(t, 'Heading'))
    expect(page.assessment.text).toBe(cell(t, 'Text'))
    expect(page.assessment.deliverablesLabel).toBeUndefined()
    expect(page.assessment.deliverables.map(({ name, text }) => ({ name, text }))).toEqual(
      [1, 2, 3, 4].map((n) => named(cell(t, `Deliverable ${n}`))),
    )
    for (const { text } of page.assessment.deliverables) expect(text).not.toMatch(/\.$/)
    expect(page.assessment.deliverables[2].text).toContain('‘net sales’')
    expect(page.assessment.deliverables.map((item) => item.icon)).toEqual(['map', 'score', 'book', 'list'])
    expect(page.assessment.deliverables.map((item) => item.name)).not.toContain('Fix list')
  })

  it('keeps implementation work out of the assessment (owner principle)', () => {
    expect(JSON.stringify(page.assessment)).not.toMatch(/connect|integrat|reconcil|pipeline|dashboard|build/i)
  })

  it('uses the stock journey: eyebrow, heading, the proposed A3 then the text, five "Name: System" steps in order, On hand highlighted, the callout and the caption, aligned to the end', () => {
    const t = 'One stock figure'
    expect(upper(journey.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(journey.eyebrow).toBe('One stock figure')
    expect(journey.heading).toBe(cell(t, 'Heading'))
    expect(journey.intro).toBe(PROPOSED.journeyIntro)
    expect(journey.text).toBe(cell(t, 'Text'))
    expect(journey.steps).toEqual(
      list(cell(t, 'Journey steps, in order')).map(named).map(({ name, text }) => ({ name, system: text })),
    )
    expect(journey.steps.map((step) => step.name)).toEqual(['Ordered', 'Received', 'Transferred', 'Sold', 'On hand'])
    expect(journey.highlight).toBe(4)
    expect(journey.steps[journey.highlight].name).toBe('On hand')
    expect(journey.highlightNote).toBe(HIGHLIGHT_NOTE)
    expect(upper(journey.callout.label)).toBe(cell(t, 'Callout label'))
    expect(journey.callout.label).toBe('Variance explained')
    expect(journey.callout.text).toBe(cell(t, 'Callout text'))
    expect(journey.callout.text).toContain('58-unit')
    expect(journey.callout.text.match(/·/g)).toHaveLength(2)
    // The stock figures are always labelled as a sample (plan section 3).
    expect(journey.caption).toBe(cell(t, 'Caption'))
    expect(journey.caption).toBe('Illustrative example. Sample data only.')
    expect(journey.calloutAlign).toBe('end')
  })

  it('uses the readiness card, with its eyebrow and no chips, and the Handled responsibly checklist (with full stops)', () => {
    const t = 'Readiness and responsible handling'
    expect(upper(page.ai.label!)).toBe(cell(t, 'Card 1 eyebrow'))
    expect(page.ai.label).toBe('Ready for what comes next')
    expect(page.ai.heading).toBe(cell(t, 'Card 1 heading'))
    expect(page.ai.text).toBe(cell(t, 'Card 1 text'))
    expect(page.ai).not.toHaveProperty('chips')
    expect(page.handling.heading).toBe(cell(t, 'Card 2 heading'))
    expect(page.handling.items).toEqual(handlingItems(cell(t, 'Card 2 checklist')))
    expect(page.handling.items).toHaveLength(3)
    for (const item of page.handling.items) expect(item).toMatch(/\.$/)
    expect([page.ai.icon, page.handling.icon]).toEqual(['gauge', 'shield'])
  })

  it('names forecasting, replenishment and anomaly detection only once each, in the readiness card, as uses the foundation can support', () => {
    const text = JSON.stringify(page)
    for (const word of ['forecasting', 'replenishment', 'anomaly detection']) {
      expect(text.match(new RegExp(word, 'gi')), word).toHaveLength(1)
      expect(page.ai.text).toContain(word)
    }
    expect(page.ai.text).toContain('the same foundation can support demand forecasting')
    expect(text).not.toMatch(/\bAI\b|Fafanua Intelligence|AI-powered|Reverse ETL/)
  })

  it('uses What happens next: its eyebrow, heading, supporting line and three service cards, the first with the proposed A2', () => {
    const t = 'What happens next'
    expect(upper(page.services.eyebrow!)).toBe(cell(t, 'Eyebrow'))
    expect(page.services.eyebrow).toBe('What happens next')
    expect(page.services.heading).toBe(cell(t, 'Heading'))
    expect(page.services.subheading).toBe(cell(t, 'Supporting line'))
    expect(page.services.leadTone).toBeUndefined()
    expect(page.services.items.map(({ name, text }) => ({ name, text }))).toEqual([1, 2, 3].map((n) => named(cell(t, `Card ${n}`))))
    expect(page.services.items.map((item) => item.detail)).toEqual([PROPOSED.serviceDetail, undefined, undefined])
    for (const item of page.services.items) expect(item.lead).toBeUndefined()
    expect(page.services.items.map((item) => [item.icon, item.service])).toEqual([
      ['link', 'data-engineering-and-integration'],
      ['shield', 'data-quality-and-reliability'],
      ['chart', 'business-intelligence-and-analytics'],
    ])
  })

  it('uses the closing panel, with the proposed A1, and the call to action and address from contact.ts', () => {
    const t = 'Closing panel'
    expect(upper(page.closing.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(page.closing.heading).toBe(cell(t, 'Heading'))
    expect(page.closing.text).toBe(cell(t, 'Text'))
    expect(page.closing.followUp).toBe(PROPOSED.closingFollowUp)
    expect(buttonLabel(cell(t, 'Primary button'))).toBe(ctaLabel)
    expect(cell(t, 'Secondary link')).toBe(`${email} (\`mailto:${email}\`)`)
  })

  it('holds the proposed A1 to A3 verbatim, each in an existing optional field, and makes the protected phrase visible only through A1', () => {
    expect(Object.values(PROPOSED)).toEqual([
      'We help retailers, wholesalers and distributors build a trusted data foundation, so every branch, depot and head office works from the same figures.',
      'Payment and loyalty data can be connected too, so customer retention can be tracked and card and mobile-money takings reconcile with sales.',
      'Where the assessment finds stock figures that do not agree, we can then help you follow each unit across the systems that record it.',
    ])
    expect(Object.values(PROPOSED).map((text) => text.length)).toEqual([148, 139, 132])
    expect([page.closing.followUp, page.services.items[0].detail, journey.intro]).toEqual(Object.values(PROPOSED))
    const strings = JSON.stringify(page)
    expect(strings.match(/trusted data foundation/g)).toHaveLength(1)
    expect(page.closing.followUp).toContain('trusted data foundation')
    expect(page.description).not.toContain('trusted data foundation')
    for (const text of Object.values(PROPOSED)) {
      expect(text).not.toMatch(COMPLIANCE_TERMS)
      expect(text).not.toMatch(/Uganda|East Africa/)
    }
  })

  it('carries the plan section 7 terms in its visible strings, case-insensitively, and the description carries four of them', () => {
    const text = visible().join(' ').toLowerCase()
    for (const term of SECTION_7_TERMS) expect(text, term).toContain(term)
    for (const term of ['retail business intelligence', 'sales analytics', 'inventory analytics', 'distribution analytics']) {
      expect(page.description.toLowerCase()).toContain(term)
    }
  })

  it('stores the capitalised labels in sentence case', () => {
    expect([
      page.hero.eyebrow,
      page.assessment.eyebrow,
      journey.eyebrow,
      journey.callout.label,
      page.ai.label,
      page.services.eyebrow,
      page.closing.eyebrow,
    ]).toEqual([
      'Retail and distribution solutions',
      'Start with trust',
      'One stock figure',
      'Variance explained',
      'Ready for what comes next',
      'What happens next',
      'Get started',
    ])
  })

  it('keeps the curly quotes, the ampersands and the middle dots as the plan writes them', () => {
    const text = JSON.stringify(page)
    expect(text.match(/‘/g)).toHaveLength(1)
    expect(text.match(/’/g)).toHaveLength(1)
    expect(text).not.toMatch(/[A-Za-z]'[a-z]/)
    for (const label of ['Loyalty & CRM', 'Distribution & delivery', 'Inventory & warehouse', 'Integrate & model', 'Quality & governance', 'Reporting & dashboards', 'Retail & distribution']) {
      expect(text).toContain(`"${label}"`)
    }
  })

  it('has no Delivered in stages, promise strip or reconciliation', () => {
    for (const field of ['stages', 'promise', 'reconciliation']) expect(page).not.toHaveProperty(field)
    expect(JSON.stringify(page)).not.toMatch(/Delivered in stages|Moves on when|"Stage"/)
  })

  it('keeps the old h1 only as the sector\'s heading in solutions.ts', () => {
    expect(solutions.find((solution) => solution.id === 'retail-and-distribution')!.heading).toBe('Retail & Distribution Analytics')
    expect(JSON.stringify(page)).not.toContain('Retail & Distribution Analytics')
  })

  it('has digits only in the callout\'s sample figures, and no compliance claim', () => {
    const text = visible().join(' ')
    expect(text.match(/\d[\d,]*/g)).toEqual(['1,240', '1,182', '58'])
    expect(journey.callout.text.match(/\d[\d,]*/g)).toEqual(['1,240', '1,182', '58'])
    expect(JSON.stringify(page)).not.toMatch(COMPLIANCE_TERMS)
    expect(JSON.stringify(page)).not.toMatch(/\bAct\b|\bLaw\b|\bAuthority\b/)
  })

  it('names no business (plan section 3): only the acronyms FMCG and CRM, each counted, and no company words', () => {
    const strings = JSON.stringify(page)
    expect(strings).not.toMatch(NAMING_TERMS)
    // No run of three or more capitals but "FMCG" (the hero lead, the
    // subheading and the third segment) and "CRM" (the first source).
    expect(strings.match(/[A-Z]{3,}/g)).toEqual(['FMCG', 'CRM', 'FMCG', 'FMCG'])
    expect(strings.match(/FMCG/g)).toHaveLength(3)
    expect(strings.match(/CRM/g)).toHaveLength(1)
  })
})

describe('old Retail & Distribution strings', () => {
  // The page's copy before issue 101: its title, description, lead,
  // context, problems, service links and texts, governance and
  // activation. The solutions.ts heading, summary and themes stay
  // (homepage and footer data), so their wording is not listed.
  const OLD = [
    'Retail & Distribution Analytics Uganda | Fafanua',
    'Sales, inventory and branch-performance analytics for supermarkets, pharmacy chains, wholesalers and distributors in Uganda and East Africa.',
    'For supermarkets, pharmacy chains, wholesalers, distributors, multi-branch retailers and consumer-goods businesses.',
    'Retail and distribution businesses generate data at every till, warehouse and delivery route',
    'Fafanua helps retailers and distributors in Uganda and East Africa build a trusted data foundation',
    'Sales, stock and payment data held in separate systems for each branch or channel.',
    'Inventory positions that do not match the stock on the shelf or in the warehouse.',
    'Card and mobile-money takings reconciled against sales by hand.',
    'Branches and products compared using different definitions.',
    'Little view of customer retention or repeat purchasing.',
    'Point-of-sale, ERP and payment integration',
    'Bring point-of-sale, ERP, stock, payment and distributor data together across branches.',
    'Sales and inventory data models',
    'Model products, branches, customers and stock movements, so every report uses the same structure.',
    'Retail payment reconciliation',
    'Automated reconciliation of card and mobile-money payments against sales.',
    'Sales and branch-performance dashboards',
    'Branch, product, sales and margin reporting for management and operations.',
    'One product and branch master, with clear ownership of changes.',
    'Agreed definitions of sales, margin and stock measures.',
    'Reconciliation rules and tolerances for payments and stock.',
    'Sending replenishment and low-stock signals to purchasing and branch teams.',
    'Pushing customer segments into loyalty and marketing tools.',
    'Sharing distributor and route performance with field sales teams.',
  ]

  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', { query: '?raw', import: 'default', eager: true }),
  ).filter(([file]) => !/\.test\.tsx?$/.test(file))

  it.each(OLD)('no source file holds "%s"', (text) => {
    expect(sources.map(([file]) => file)).toContain('/src/data/solutionPages.ts')
    for (const [file, source] of sources) expect(source.includes(text), file).toBe(false)
  })

  it('has none of the old §18 fields on the entry, and none of the old audience words', () => {
    for (const field of ['lead', 'context', 'audiences', 'problems', 'governance', 'activation']) {
      expect(page).not.toHaveProperty(field)
    }
    expect(JSON.stringify(page)).not.toMatch(/pharmacy chains|supermarkets/i)
  })
})
