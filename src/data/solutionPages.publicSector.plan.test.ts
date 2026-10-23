// Checks the Public Sector page's entry in solutionPages.ts against
// section 4 of _docs/fafanua-public-sector-landing-page-plan.md (#93), so
// its wording cannot drift from the plan: every string character for
// character, the labels the plan writes in capitals compared in upper
// case (CSS shows them so), the "Name: text" and list splits, the title
// and description, and the figure's accessible description (plan section
// 6). It also checks that the old Public Sector strings are gone from
// src/ and that the call to action and address come from contact.ts.
import { describe, expect, it } from 'vitest'
import {
  buttonLabel,
  cell,
  DESCRIPTION,
  figureDescription,
  list,
  marked,
  named,
  stage,
  tables,
  TITLE,
} from '../test/publicSectorPlan.ts'
import { ctaLabel, email } from './contact.ts'
import { solutionPages, type SectorLandingPage } from './solutionPages.ts'
import { solutions } from './solutions.ts'

const entry = solutionPages['public-sector']
if (entry.layout !== 'sector') throw new Error('Public Sector is not on the shared foundation')
const page: SectorLandingPage = entry
const upper = (text: string) => text.toUpperCase()

describe('plan section 4 parser', () => {
  it('finds the nine copy tables in order', () => {
    expect([...tables.keys()]).toEqual([
      'Hero',
      'Trace diagram',
      'Challenge and approach',
      'Who we work with',
      'The Data Trust Assessment',
      'Delivered in stages',
      'AI and public rules',
      'After the assessment',
      'Closing panel',
      'Removed from the current Public Sector page',
    ])
  })
})

describe('Public Sector copy (plan section 4)', () => {
  it('has the issue\'s title and description, with the assigned keywords and the protected phrase', () => {
    expect(page.title).toBe(TITLE)
    expect(page.description).toBe(DESCRIPTION)
    expect(page.title).toHaveLength(54)
    expect(page.description).toHaveLength(155)
    expect(page.description).toContain('trusted data foundation')
  })

  it('uses the hero\'s breadcrumb, eyebrow, heading, lead and buttons', () => {
    expect(cell('Hero', 'Breadcrumb').split(' › ')).toEqual(['Home', 'Solutions', page.breadcrumb])
    expect(upper(page.hero.eyebrow)).toBe(cell('Hero', 'Eyebrow'))
    expect(page.hero.eyebrow).toBe('Public sector solutions')
    expect(page.hero.heading).toBe(cell('Hero', 'Heading (`h1`)'))
    expect(page.hero.lead).toBe(cell('Hero', 'Lead'))
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
    expect(d.figures).toEqual(list(cell('Trace diagram', 'Figures and ratings')).map(marked).map(({ name, rating, marker }) => ({ name, rating, marker })))
    expect(d.caption).toBe(cell('Trace diagram', 'Caption'))
    expect(d.description).toBe(figureDescription)
  })

  it('feeds the figures from the three sources plan section 5 draws solid, with its icons', () => {
    expect(page.diagram.sources.map((source) => [source.label, source.icon, source.feeds])).toEqual([
      ['HR & payroll', 'book', false],
      ['Programme monitoring', 'chart', false],
      ['Case & applications', 'list', true],
      ['Finance & budget', 'ledger', true],
      ['Revenue & collections', 'card', true],
    ])
  })

  it('uses the challenge and approach cards', () => {
    expect(page.challenge.heading).toBe(cell('Challenge and approach', 'Card 1 heading'))
    expect(page.challenge.text).toBe(cell('Challenge and approach', 'Card 1 text'))
    expect(page.approach.heading).toBe(cell('Challenge and approach', 'Card 2 heading'))
    expect(page.approach.text).toBe(cell('Challenge and approach', 'Card 2 text'))
    expect([page.challenge.icon, page.approach.icon]).toEqual(['alert', 'check'])
  })

  it('uses Who we work with, its card and its checklist (no full stops)', () => {
    const t = 'Who we work with'
    expect(page.audience.heading).toBe(cell(t, 'Heading'))
    expect(page.audience.subheading).toBe(cell(t, 'Subheading'))
    expect(page.audience.card.heading).toBe(cell(t, 'Card heading'))
    expect(page.audience.card.text).toBe(cell(t, 'Card text'))
    expect(page.audience.card.items).toEqual(list(cell(t, 'Checklist')))
    for (const item of page.audience.card.items) expect(item).not.toMatch(/\.$/)
    expect(page.audience.card.icon).toBe('book')
  })

  it('uses the Data Trust Assessment\'s eyebrow, heading, text and deliverables (no full stops)', () => {
    const t = 'The Data Trust Assessment'
    expect(upper(page.assessment.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(page.assessment.heading).toBe(cell(t, 'Heading'))
    expect(page.assessment.text).toBe(cell(t, 'Text'))
    expect(page.assessment.deliverables.map(({ name, text }) => ({ name, text }))).toEqual(
      [1, 2, 3, 4].map((n) => named(cell(t, `Deliverable ${n}`))),
    )
    for (const { text } of page.assessment.deliverables) expect(text).not.toMatch(/\.$/)
    expect(page.assessment.deliverables.map((item) => item.icon)).toEqual(['map', 'score', 'book', 'list'])
  })

  it('uses Delivered in stages: eyebrow, heading, subheading, exit label and four stages in order', () => {
    const t = 'Delivered in stages'
    const stages = page.stages!
    expect(upper(stages.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(stages.heading).toBe(cell(t, 'Heading'))
    expect(stages.subheading).toBe(cell(t, 'Subheading'))
    expect(upper(stages.exitLabel)).toBe(cell(t, 'Exit label'))
    expect(stages.stageLabel).toBe('Stage')
    expect(stages.items).toEqual([1, 2, 3, 4].map((n) => stage(cell(t, `Stage ${n}`))))
    expect(stages.items.map((item) => item.name)).toEqual(['Assess', 'Foundation', 'First use cases', 'Extend'])
    for (const item of stages.items) {
      expect(item.description).toMatch(/\.$/)
      expect(item.exit).not.toMatch(/\.$/)
    }
  })

  it('uses the AI card, its chips and the public rules checklist (with full stops)', () => {
    const t = 'AI and public rules'
    expect(page.ai.heading).toBe(cell(t, 'Card 1 heading'))
    expect(page.ai.text).toBe(cell(t, 'Card 1 text'))
    expect(page.ai.chips).toEqual(
      list(cell(t, 'Card 1 chips')).map(marked).map(({ name, marker }) => ({ label: name, marker })),
    )
    expect(page.handling.heading).toBe(cell(t, 'Card 2 heading'))
    expect(page.handling.items).toEqual(list(cell(t, 'Card 2 checklist')))
    for (const item of page.handling.items) expect(item).toMatch(/\.$/)
    expect([page.ai.icon, page.handling.icon]).toEqual(['gauge', 'shield'])
  })

  it('uses After the assessment and its three service cards (with full stops), each linked to its service', () => {
    const t = 'After the assessment'
    expect(page.services.heading).toBe(cell(t, 'Heading'))
    expect(page.services.subheading).toBe(cell(t, 'Subheading'))
    expect(page.services.items.map(({ name, text }) => ({ name, text }))).toEqual(
      [1, 2, 3].map((n) => named(cell(t, `Card ${n}`))),
    )
    for (const { text } of page.services.items) expect(text).toMatch(/\.$/)
    expect(page.services.items.map((item) => [item.icon, item.service])).toEqual([
      ['link', 'data-engineering-and-integration'],
      ['shield', 'data-quality-and-reliability'],
      ['chart', 'business-intelligence-and-analytics'],
    ])
  })

  it('uses the closing panel, with the call to action and address from contact.ts', () => {
    const t = 'Closing panel'
    expect(upper(page.closing.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(page.closing.heading).toBe(cell(t, 'Heading'))
    expect(page.closing.text).toBe(cell(t, 'Text'))
    expect(buttonLabel(cell(t, 'Primary button'))).toBe(ctaLabel)
    expect(cell(t, 'Secondary link')).toBe(`${email} (\`mailto:${email}\`)`)
  })

  it('stores the capitalised labels in sentence case', () => {
    expect([page.hero.eyebrow, page.assessment.eyebrow, page.stages!.eyebrow, page.stages!.exitLabel, page.closing.eyebrow]).toEqual([
      'Public sector solutions',
      'Start with trust',
      'Delivered in stages',
      'Moves on when',
      'Get started',
    ])
  })

  it('keeps the old h1 only as the sector\'s heading in solutions.ts', () => {
    expect(solutions.find((solution) => solution.id === 'public-sector')!.heading).toBe('Public Sector Data & Analytics')
    expect(JSON.stringify(page)).not.toContain('Public Sector Data & Analytics')
  })

  it('has no digits, figures, products or compliance claims', () => {
    const text = JSON.stringify({ ...page, title: undefined, description: undefined })
    expect(text).not.toMatch(/\d/)
    expect(JSON.stringify(page)).not.toMatch(/Fafanua Intelligence|AI-powered|DHIS|complian|certified|guarantee|meets the requirements of|\bAct\b|Regulation/i)
  })
})

describe('old Public Sector strings', () => {
  // The page's copy before #93: its lead, context, problems, service
  // links and texts, governance and activation, and the closing line
  // that only its old closing section showed there.
  const OLD = [
    'Government & Public Sector Data Analytics Uganda | Fafanua',
    'Data integration, warehousing, governance and performance dashboards for ministries, agencies and public institutions in Uganda and East Africa.',
    'For ministries, departments, agencies, local governments and public institutions.',
    'Public institutions manage data across many systems',
    'Fafanua helps public-sector organisations in Uganda and East Africa build a trusted data foundation',
    'Data held in separate systems across departments, agencies and districts.',
    'Performance reports compiled by hand, often late and hard to verify.',
    'The same indicator defined differently by different institutions.',
    'Unclear ownership and documentation of key datasets.',
    'Sensitive citizen data without consistent classification or access controls.',
    'Government data integration',
    'Public sector data warehouse',
    'Government data governance',
    'Government dashboards',
    'Cross-system integration between financial, administrative and sector systems.',
    'A data warehouse that consolidates institutional data, with its history preserved.',
    'Measurable quality controls for the data behind official reporting.',
    'Metadata and governance programmes: ownership, glossaries, lineage and access policies.',
    'Institutional-performance and service-delivery dashboards, and government reporting automation.',
    'Data ownership and stewardship across ministries, departments and agencies.',
    'Shared indicator definitions and metadata standards.',
    'Classification and access policies for citizen and other sensitive data.',
    'Lineage that shows how published figures were produced.',
    'Sharing service-delivery alerts with the teams responsible for them.',
    'Returning verified registry data to operational systems.',
    'Exposing trusted indicators in the management tools departments use.',
  ]

  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', { query: '?raw', import: 'default', eager: true }),
  ).filter(([file]) => !/\.test\.tsx?$/.test(file))

  it.each(OLD)('no source file holds "%s"', (text) => {
    expect(sources.map(([file]) => file)).toContain('/src/data/solutionPages.ts')
    for (const [file, source] of sources) expect(source.includes(text), file).toBe(false)
  })

  it('has none of the old §18 fields on the entry', () => {
    for (const field of ['lead', 'context', 'problems', 'governance', 'activation']) {
      expect(page).not.toHaveProperty(field)
    }
  })
})
