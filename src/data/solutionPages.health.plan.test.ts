// Checks the Health page's entry in solutionPages.ts against section 4 of
// _docs/fafanua-health-landing-page-plan.md (#94), so its wording cannot
// drift from the plan: every string character for character, the labels
// the plan writes in capitals compared in upper case (CSS shows them so),
// the "Name: text" and list splits, the title and description, the
// figure's accessible description (plan section 8), the owner's new Who
// we work with and After the assessment copy (a55c2b4) and the owner's
// closing addition; the four withdrawn keyword lines are gone. It also checks that the old Health strings are gone from
// src/ and that the call to action and address come from contact.ts.
import { describe, expect, it } from 'vitest'
import {
  boldNamed,
  buttonLabel,
  CARRIED_TERMS,
  cell,
  DESCRIPTION,
  figureDescription,
  list,
  marked,
  named,
  OWNER_ADDITIONS,
  tables,
  TITLE,
} from '../test/healthPlan.ts'
import { ctaLabel, email } from './contact.ts'
import { solutionPages, type SectorLandingPage } from './solutionPages.ts'
import { solutions } from './solutions.ts'

const entry = solutionPages.health
if (entry.layout !== 'sector') throw new Error('Health is not on the shared foundation')
const page: SectorLandingPage = entry
const upper = (text: string) => text.toUpperCase()

// The four keyword lines first proposed for #94 (A1–A4), withdrawn when
// the owner rewrote the plan's Who we work with and After the assessment
// copy (a55c2b4).
const WITHDRAWN = [
  'We work with the health information systems your organisation already runs in Uganda, including those behind pharmacy analytics, medical inventory analytics and health supply chain analytics.',
  'Health systems integration in Uganda, with health systems interoperability through APIs and health data exchange, into one health data warehouse.',
  'Health data quality and health data governance in Uganda, with a health data quality framework your branches can keep up.',
  'Healthcare analytics in Uganda and East Africa, from health facility performance dashboards and facility utilisation analytics to patient flow analytics and health service delivery analytics.',
] as const

describe('Health plan section 4 parser', () => {
  it('finds the eight copy tables and the removed list in order', () => {
    expect([...tables.keys()]).toEqual([
      'Hero',
      'Trace diagram',
      'Challenge and approach',
      'Who we work with',
      'The Data Trust Assessment',
      'AI and responsible handling',
      'After the assessment',
      'Closing panel',
      'Removed from the current Health page',
    ])
  })
})

describe('Health copy (plan section 4)', () => {
  it('has the issue\'s title and description, with the assigned keywords and the protected phrase', () => {
    expect(page.title).toBe(TITLE)
    expect(page.description).toBe(DESCRIPTION)
    expect(page.title).toHaveLength(48)
    expect(page.description).toHaveLength(144)
    expect(page.title).toContain('Health Data Analytics Uganda')
    expect(page.description).toContain('trusted data foundation')
    expect(page.description).toContain('healthcare analytics')
    expect(page.description).toContain('Uganda and East Africa')
  })

  it('uses the hero\'s breadcrumb, eyebrow, heading, lead and buttons', () => {
    expect(cell('Hero', 'Breadcrumb').split(' › ')).toEqual(['Home', 'Solutions', page.breadcrumb])
    expect(upper(page.hero.eyebrow)).toBe(cell('Hero', 'Eyebrow'))
    expect(page.hero.eyebrow).toBe('Health solutions')
    expect(page.hero.heading).toBe(cell('Hero', 'Heading (`h1`)'))
    expect(page.hero.lead).toBe(cell('Hero', 'Lead'))
    expect(buttonLabel(cell('Hero', 'Primary button'))).toBe(ctaLabel)
    expect(cell('Hero', 'Primary button')).toContain(`\`mailto:${email}\``)
    expect(page.hero.secondaryLabel).toBe(buttonLabel(cell('Hero', 'Secondary button')))
  })

  it('uses the trace diagram\'s headings, sources, steps, numbers, ratings and caption', () => {
    const d = page.diagram
    expect(d.sourcesHeading).toBe(cell('Trace diagram', 'Left column heading'))
    expect(d.sources.map((source) => source.label)).toEqual(list(cell('Trace diagram', 'Sources')))
    expect(d.traceHeading).toBe(cell('Trace diagram', 'Middle box heading'))
    expect(d.steps).toEqual(list(cell('Trace diagram', 'Middle steps')))
    expect(d.traceFootnote).toBe(cell('Trace diagram', 'Middle footnote'))
    expect(d.figuresHeading).toBe(cell('Trace diagram', 'Right column heading'))
    expect(d.figures).toEqual(
      list(cell('Trace diagram', 'Numbers and ratings')).map(marked).map(({ name, rating, marker }) => ({ name, rating, marker })),
    )
    expect(d.figures.map((figure) => figure.marker)).toEqual(['amber', 'teal', 'hollow'])
    expect(d.caption).toBe(cell('Trace diagram', 'Caption'))
    expect(d.description).toBe(figureDescription)
    expect(d.description).toBe(
      'Illustrative example: revenue by branch traced to billing, pharmacy dispensing and the finance ledger, with trust ratings for three numbers.',
    )
  })

  it('feeds the numbers from the three sources plan section 5 draws solid, with its icons', () => {
    expect(page.diagram.sources.map((source) => [source.label, source.icon, source.feeds])).toEqual([
      ['EMR / HMIS', 'hospital', false],
      ['Laboratory', 'flask', false],
      ['Billing & insurance', 'card', true],
      ['Pharmacy dispensing', 'pill', true],
      ['Finance ledger', 'ledger', true],
    ])
  })

  it('uses the challenge and approach cards', () => {
    expect(page.challenge.heading).toBe(cell('Challenge and approach', 'Card 1 heading'))
    expect(page.challenge.text).toBe(cell('Challenge and approach', 'Card 1 text'))
    expect(page.approach.heading).toBe(cell('Challenge and approach', 'Card 2 heading'))
    expect(page.approach.text).toBe(cell('Challenge and approach', 'Card 2 text'))
    expect([page.challenge.icon, page.approach.icon]).toEqual(['alert', 'check'])
  })

  it('uses Who we work with: its card\'s two paragraphs, the list label and four bold-named items', () => {
    const t = 'Who we work with'
    expect(page.audience.heading).toBe(cell(t, 'Heading'))
    expect(page.audience.subheading).toBe(cell(t, 'Subheading'))
    expect(page.audience.card!.heading).toBe(cell(t, 'Card heading'))
    expect(page.audience.card!.text).toBe(cell(t, 'Card text 1'))
    expect(page.audience.card!.detail).toBe(cell(t, 'Card text 2'))
    expect(page.audience.card!.detail).toContain(' — ')
    expect(page.audience.card!.itemsLabel).toBe(cell(t, 'List label'))
    expect(page.audience.card!.items).toEqual([1, 2, 3, 4].map((n) => boldNamed(cell(t, `List item ${n}`))))
    for (const item of page.audience.card!.items) {
      if (typeof item === 'string') throw new Error(`"${item}" has no bold name`)
      expect(item.text).toMatch(/\.$/)
      expect(item.name).not.toMatch(/\*|—/)
    }
    expect(page.audience.card!.icon).toBe('hospital')
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

  it('has no Delivered in stages section', () => {
    expect(page.stages).toBeUndefined()
    expect(page).not.toHaveProperty('stages')
    expect(JSON.stringify(page)).not.toMatch(/Delivered in stages|Moves on when|"Stage"/)
  })

  it('uses the AI card, its chips and the Handled responsibly checklist (with full stops)', () => {
    const t = 'AI and responsible handling'
    expect(page.ai.heading).toBe(cell(t, 'Card 1 heading'))
    expect(page.ai.text).toBe(cell(t, 'Card 1 text'))
    expect(page.ai.chips).toEqual(
      list(cell(t, 'Card 1 chips')).map(marked).map(({ name, marker }) => ({ label: name, marker })),
    )
    expect(page.handling.heading).toBe(cell(t, 'Card 2 heading'))
    // The plan ends each item with a full stop, so the list splits at ".; ".
    expect(page.handling.items).toEqual(cell(t, 'Card 2 checklist').split(/(?<=\.); /))
    expect(page.handling.items).toHaveLength(3)
    for (const item of page.handling.items) expect(item).toMatch(/\.$/)
    expect([page.ai.icon, page.handling.icon]).toEqual(['gauge', 'shield'])
  })

  it('uses After the assessment: its subheading and three service cards with a lead and text, each linked to its service', () => {
    const t = 'After the assessment'
    expect(page.services.heading).toBe(cell(t, 'Heading'))
    expect(page.services.subheading).toBe(cell(t, 'Subheading'))
    expect(page.services.items.map(({ name, lead, text }) => ({ name, lead, text }))).toEqual(
      [1, 2, 3].map((n) => ({
        name: cell(t, `Card ${n} heading`),
        lead: cell(t, `Card ${n} lead`),
        text: cell(t, `Card ${n} text`),
      })),
    )
    for (const { lead, text } of page.services.items) {
      expect(lead).toMatch(/\.$/)
      expect(text).toMatch(/\.$/)
    }
    // The withdrawn keyword lines (A2–A4) are gone.
    expect(page.services.items.map((item) => item.detail)).toEqual([undefined, undefined, undefined])
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
    // The owner's follow-up sentence (#94), which makes the protected
    // phrase visible.
    expect(page.closing.followUp).toBe(OWNER_ADDITIONS.closingFollowUp)
    expect(page.closing.followUp).toContain('trusted data foundation')
    expect(buttonLabel(cell(t, 'Primary button'))).toBe(ctaLabel)
    expect(cell(t, 'Secondary link')).toBe(`${email} (\`mailto:${email}\`)`)
  })

  it('holds the owner\'s one remaining addition (A5) verbatim, and none of the withdrawn A1–A4 lines', () => {
    expect(Object.values(OWNER_ADDITIONS)).toEqual(['Then we make sure they are built on a trusted data foundation.'])
    expect(WITHDRAWN).toHaveLength(4)
    const text = JSON.stringify(page)
    for (const line of WITHDRAWN) expect(text, line).not.toContain(line)
  })

  it('carries the reported SEO plan §9 terms in the plan copy\'s visible text', () => {
    const visible = JSON.stringify({ ...page, title: undefined, description: undefined })
    for (const [term, pattern] of CARRIED_TERMS) expect(visible, term).toMatch(pattern)
    expect(CARRIED_TERMS).toHaveLength(8)
  })

  it('stores the capitalised labels in sentence case', () => {
    expect([page.hero.eyebrow, page.assessment.eyebrow, page.closing.eyebrow]).toEqual([
      'Health solutions',
      'Start with trust',
      'Get started',
    ])
  })

  it('keeps the old h1 only as the sector\'s heading in solutions.ts', () => {
    expect(solutions.find((solution) => solution.id === 'health')!.heading).toBe('Health Data & Analytics Solutions')
    expect(JSON.stringify(page)).not.toContain('Health Data & Analytics Solutions')
  })

  it('has no digits, figures, products, clinical or compliance claims', () => {
    const text = JSON.stringify({ ...page, title: undefined, description: undefined })
    expect(text).not.toMatch(/\d/)
    expect(JSON.stringify(page)).not.toMatch(
      /Fafanua Intelligence|AI-powered|DHIS|complian|certified|guarantee|meets the requirements of|in line with the Act|\bAct\b|Regulation|diagnos/i,
    )
  })
})

describe('old Health strings', () => {
  // The page's copy before #94: its title, description, lead, context,
  // audiences, problems, service links and texts, governance and
  // activation. Strings that name keywords the owner's additions bring
  // back are left out; the solutions.ts heading and themes stay (homepage
  // data), so their wording is not listed either.
  const OLD = [
    'Healthcare & Health Data Analytics Uganda | Fafanua',
    'Fafanua helps healthcare providers and health programmes connect data systems, improve data quality, build trusted reporting and create actionable healthcare analytics.',
    'For hospitals, clinic networks, laboratories and pharmacies, and for public and global-health programmes.',
    'Health organisations depend on data from many systems',
    'national health information systems',
    'Fafanua helps healthcare providers and health programmes in Uganda and East Africa build a trusted data foundation',
    'For hospitals, clinic networks, laboratories and pharmacies, analytics starts with operations and finance.',
    'Revenue, billing and insurance-claims reporting',
    'Pharmacy and medical inventory analytics',
    'Public and global-health programmes',
    'For health ministries, district health teams, implementing partners and global-health programmes',
    'Health programme performance dashboards',
    'Public-health reporting and indicator tracking',
    'Longitudinal patient and programme outcomes',
    'Health supply-chain analytics',
    'Donor and stakeholder reporting',
    'Patient, service and financial data held in separate systems that do not exchange data.',
    'Reports to national systems, donors and boards prepared by hand from different sources.',
    'Incomplete, late or inconsistent facility data that undermines trust in indicators.',
    'Little visibility of stock levels and expiries across facilities.',
    'Patient and programme outcomes that are hard to follow over time.',
    'Sensitive health data shared without clear ownership or access rules.',
    'Health system integration and interoperability',
    'Connect medical-record, laboratory, pharmacy, billing and health information systems through APIs, data exchange and monitored pipelines.',
    'Health data warehousing',
    'A health data warehouse that models patients, encounters, facilities, services and stock consistently.',
    'Completeness, timeliness and consistency checks on facility and programme data before it reaches reports.',
    'Ownership, classification and access policies for patient and programme data, and shared indicator definitions.',
    'Healthcare analytics and dashboards',
    'Facility, programme and public-health dashboards, and automated health reporting.',
    'Managed health data services',
    'Ongoing monitoring, support and improvement of health data pipelines and reporting.',
    'Classification and access controls for patient-level and other sensitive health data.',
    'Shared indicator definitions across facilities, programmes and reporting levels.',
    'Data-quality rules for the completeness, timeliness and consistency of facility reporting.',
    'Lineage from published indicators back to the source records.',
    'Sharing stock and expiry alerts with pharmacy and supply teams.',
    'Returning follow-up lists to facility and outreach teams.',
    'Exposing trusted facility indicators inside operational and management tools.',
    // Superseded by the owner's new copy (a55c2b4, #94): the first card
    // text, checklist and service texts, and the withdrawn A1–A4 lines.
    'For organisations running more than one branch, ward or service line.',
    'Branch performance and comparability',
    'Revenue, billing and insurance-claims reconciliation',
    'Pharmacy and medical stock analytics',
    'Connect billing, pharmacy, lab and finance systems into one consistent view of patients, visits, services and stock.',
    'Automated branch and head-office reporting built on the traced numbers.',
    ...WITHDRAWN,
  ]

  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', { query: '?raw', import: 'default', eager: true }),
  ).filter(([file]) => !/\.test\.tsx?$/.test(file))

  it.each(OLD)('no source file holds "%s"', (text) => {
    expect(sources.map(([file]) => file)).toContain('/src/data/solutionPages.ts')
    for (const [file, source] of sources) expect(source.includes(text), file).toBe(false)
  })

  it('has none of the old §18 fields on the entry', () => {
    for (const field of ['lead', 'context', 'audiences', 'problems', 'governance', 'activation']) {
      expect(page).not.toHaveProperty(field)
    }
  })
})
