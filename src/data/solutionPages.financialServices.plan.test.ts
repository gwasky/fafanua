// Checks the Financial Services page's entry in solutionPages.ts against
// section 4 of _docs/fafanua-financial-services-landing-page-plan.md
// (#98), so its wording cannot drift from the plan: every string character
// for character, the labels the plan writes in capitals compared in upper
// case (CSS shows them so), the "Name: text" and list splits, the promise
// strip's groups and steps, the reconciliation cards, the title and
// description, the figure's accessible description (plan section 6) and
// the owner's two additions A1 and A2 (2026-10-24), and that the
// withdrawn first proposals are gone. It also checks that the old
// Financial Services strings are gone from src/, the naming and claims
// rules (plan section 3), and that the call to action and address come
// from contact.ts.
import { describe, expect, it } from 'vitest'
import {
  buttonLabel,
  cell,
  comparison,
  DESCRIPTION,
  figureDescription,
  FORBIDDEN_TERMS,
  list,
  marked,
  named,
  OWNER_ADDITIONS,
  tables,
  TITLE,
} from '../test/financialServicesPlan.ts'
import { ctaLabel, email } from './contact.ts'
import { solutionPages, type SectorLandingPage } from './solutionPages.ts'
import { solutions } from './solutions.ts'

const entry = solutionPages['financial-services']
if (entry.layout !== 'sector') throw new Error('Financial Services is not on the shared foundation')
const page: SectorLandingPage = entry
const upper = (text: string) => text.toUpperCase()

// The PM's first proposals for A1 and A2 (#98), replaced by the owner's
// own copy on 2026-10-24.
const WITHDRAWN = [
  'Then we make sure your reports are built on a trusted data foundation.',
  'In Uganda and East Africa, that includes banking analytics, payment and revenue reconciliation, and financial reporting automation.',
] as const

describe('Financial Services plan section 4 parser', () => {
  it('finds the ten copy tables and the removed list in order', () => {
    expect([...tables.keys()]).toEqual([
      'Hero',
      'Trace diagram',
      'Challenge and approach',
      'Promise strip',
      'Who we work with',
      'The Data Trust Assessment',
      'Reconciliation (what we can implement)',
      'AI and responsible handling',
      'After the assessment',
      'Closing panel',
      'Removed from the current Financial Services page',
    ])
  })
})

describe('Financial Services copy (plan section 4)', () => {
  it('has the issue\'s title and description, with the assigned keywords and the protected phrase', () => {
    expect(page.title).toBe(TITLE)
    expect(page.description).toBe(DESCRIPTION)
    expect(page.title).toHaveLength(51)
    expect(page.description).toHaveLength(164)
    expect(page.title).toContain('Banking Analytics Uganda')
    expect(page.description).toContain('trusted data foundation')
    expect(page.description).toContain('financial services analytics')
    expect(page.description).toContain('microfinance institutions, SACCOs')
    expect(page.description).toContain('Uganda')
    expect(page.description.startsWith(`${page.hero.heading.replace(/\.$/, '')}: `)).toBe(true)
  })

  it('uses the hero\'s breadcrumb, eyebrow, heading, two lead paragraphs and buttons', () => {
    expect(cell('Hero', 'Breadcrumb').split(' › ')).toEqual(['Home', 'Solutions', page.breadcrumb])
    expect(upper(page.hero.eyebrow)).toBe(cell('Hero', 'Eyebrow'))
    expect(page.hero.eyebrow).toBe('Financial services solutions')
    expect(page.hero.heading).toBe(cell('Hero', 'Heading (`h1`)'))
    expect(page.hero.lead).toBe(cell('Hero', 'Lead, paragraph 1'))
    expect(page.hero.leadDetail).toBe(cell('Hero', 'Lead, paragraph 2'))
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
    expect(d.figures.map((figure) => figure.marker)).toEqual(['amber', 'teal', 'hollow'])
    expect(d.caption).toBe(cell('Trace diagram', 'Caption'))
    expect(d.description).toBe(figureDescription)
    expect(d.description).toBe(
      'Illustrative example: portfolio at risk, mobile money settlements and loan book against ledger traced to loan, payment and ledger systems, with trust ratings.',
    )
  })

  it('feeds the figures from the three sources plan section 5 draws solid, with its icons', () => {
    expect(page.diagram.sources.map((source) => [source.label, source.icon, source.feeds])).toEqual([
      ['CRM', 'chart', false],
      ['Card & ATM switch', 'card', false],
      ['Loan management', 'list', true],
      ['Payments & mobile money', 'card', true],
      ['General ledger', 'ledger', true],
    ])
  })

  it('uses the challenge and approach cards: label, heading and two paragraphs each', () => {
    const t = 'Challenge and approach'
    for (const [card, n] of [
      [page.challenge, 1],
      [page.approach, 2],
    ] as const) {
      expect(upper(card.label!)).toBe(cell(t, `Card ${n} label`))
      expect(card.heading).toBe(cell(t, `Card ${n} heading`))
      expect(card.text).toBe(cell(t, `Card ${n} paragraph 1`))
      expect(card.detail).toBe(cell(t, `Card ${n} paragraph 2`))
    }
    expect([page.challenge.label, page.approach.label]).toEqual(['The challenge', 'Our approach'])
    // A straight apostrophe, as the plan writes it.
    expect(page.challenge.detail).toContain("don't")
    expect([page.challenge.icon, page.approach.icon]).toEqual(['alert', 'check'])
  })

  it('uses the promise strip: steps 1 and 2 under the assessment, 3 and 4 after it, in order', () => {
    const t = 'Promise strip'
    const promise = page.promise!
    expect(promise.groups.map((group) => upper(group.label))).toEqual([cell(t, 'Group 1 label'), cell(t, 'Group 2 label')])
    expect(promise.groups.map((group) => group.label)).toEqual(['The data trust assessment', 'After the assessment'])
    expect(promise.groups.flatMap((group) => group.steps)).toEqual([1, 2, 3, 4].map((n) => named(cell(t, `Step ${n}`))))
    expect(promise.groups[0].steps).toEqual([named(cell(t, 'Step 1')), named(cell(t, 'Step 2'))])
    expect(promise.groups[1].steps).toEqual([named(cell(t, 'Step 3')), named(cell(t, 'Step 4'))])
    for (const step of promise.groups.flatMap((group) => group.steps)) expect(step.text).not.toMatch(/\.$/)
  })

  it('uses Who we work with: its card, the owner\'s A2 and four stacked named items', () => {
    const t = 'Who we work with'
    expect(page.audience.heading).toBe(cell(t, 'Heading'))
    expect(page.audience.subheading).toBe(cell(t, 'Subheading'))
    expect(page.audience.card!.heading).toBe(cell(t, 'Card heading'))
    expect(page.audience.card!.text).toBe(cell(t, 'Card text'))
    expect(page.audience.card!.detail).toBe(OWNER_ADDITIONS.audienceDetail)
    expect(page.audience.card!.itemsLabel).toBeUndefined()
    expect(page.audience.card!.itemsLayout).toBe('stacked')
    expect(page.audience.card!.items).toEqual([1, 2, 3, 4].map((n) => named(cell(t, `Item ${n}`))))
    expect(page.audience.card!.icon).toBe('ledger')
  })

  it('uses the Data Trust Assessment\'s eyebrow, heading, text, deliverables label and deliverables (with full stops)', () => {
    const t = 'The Data Trust Assessment'
    expect(upper(page.assessment.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(page.assessment.heading).toBe(cell(t, 'Heading'))
    expect(page.assessment.text).toBe(cell(t, 'Text'))
    expect(upper(page.assessment.deliverablesLabel!)).toBe(cell(t, 'Deliverables label'))
    expect(page.assessment.deliverablesLabel).toBe('The assessment delivers')
    expect(page.assessment.deliverables.map(({ name, text }) => ({ name, text }))).toEqual(
      [1, 2, 3, 4].map((n) => named(cell(t, `Deliverable ${n}`))),
    )
    for (const { text } of page.assessment.deliverables) expect(text).toMatch(/\.$/)
    expect(page.assessment.deliverables.map((item) => item.icon)).toEqual(['map', 'score', 'book', 'list'])
  })

  it('keeps reconciliation and automated controls out of the assessment (plan section 3)', () => {
    const assessment = JSON.stringify(page.assessment)
    expect(assessment).not.toMatch(/reconcil|automated controls|Reconciled|Validated/i)
  })

  it('has no Delivered in stages section', () => {
    expect(page.stages).toBeUndefined()
    expect(page).not.toHaveProperty('stages')
    expect(JSON.stringify(page)).not.toMatch(/Delivered in stages|Moves on when|"Stage"/)
  })

  it('uses the reconciliation section: eyebrow, heading, text, three cards with their statuses and icons, and caption', () => {
    const t = 'Reconciliation (what we can implement)'
    const r = page.reconciliation!
    expect(upper(r.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(r.eyebrow).toBe('After the assessment · What we can implement')
    expect(r.heading).toBe(cell(t, 'Heading'))
    expect(r.text).toBe(cell(t, 'Text'))
    expect(r.cards).toEqual([1, 2, 3].map((n) => comparison(cell(t, `Card ${n}`))))
    expect(r.cards.map((card) => [card.status, card.statusIcon])).toEqual([
      ['Reconciled', 'check'],
      ['3 exceptions', 'alert'],
      ['Validated', 'check'],
    ])
    // The plan's own words for the comparison, hidden before each source.
    expect(r.comparedLabel).toBe('compared with')
    expect(cell(t, 'Card 1')).toContain(`; ${r.comparedLabel} `)
    expect(r.caption).toBe(cell(t, 'Caption'))
  })

  it('uses the AI card, its chips and the Handled responsibly checklist (with full stops)', () => {
    const t = 'AI and responsible handling'
    expect(page.ai.heading).toBe(cell(t, 'Card 1 heading'))
    expect(page.ai.text).toBe(cell(t, 'Card 1 text'))
    expect(page.ai.chips).toEqual(
      list(cell(t, 'Card 1 chips')).map(marked).map(({ name, marker }) => ({ label: name, marker })),
    )
    expect(page.handling.heading).toBe(cell(t, 'Card 2 heading'))
    expect(page.handling.items).toEqual(cell(t, 'Card 2 checklist').split(/(?<=\.); /))
    expect(page.handling.items).toHaveLength(3)
    for (const item of page.handling.items) expect(item).toMatch(/\.$/)
    expect([page.ai.icon, page.handling.icon]).toEqual(['gauge', 'shield'])
  })

  it('uses After the assessment: its subheading and three service cards with a teal lead and text, each linked to its service', () => {
    const t = 'After the assessment'
    expect(page.services.heading).toBe(cell(t, 'Heading'))
    expect(page.services.subheading).toBe(cell(t, 'Subheading'))
    expect(page.services.leadTone).toBe('accent')
    expect(page.services.items.map(({ name, lead, text }) => ({ name, lead, text }))).toEqual(
      [1, 2, 3].map((n) => {
        const [name, lead, text] = cell(t, `Card ${n}`).split(' / ')
        return { name, lead, text }
      }),
    )
    expect(page.services.items.map((item) => item.detail)).toEqual([undefined, undefined, undefined])
    expect(page.services.items.map((item) => [item.icon, item.service])).toEqual([
      ['link', 'data-engineering-and-integration'],
      ['shield', 'data-quality-and-reliability'],
      ['chart', 'business-intelligence-and-analytics'],
    ])
  })

  it('uses the closing panel, with the owner\'s A1, and the call to action and address from contact.ts', () => {
    const t = 'Closing panel'
    expect(upper(page.closing.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(page.closing.heading).toBe(cell(t, 'Heading'))
    expect(page.closing.text).toBe(cell(t, 'Text'))
    expect(page.closing.followUp).toBe(OWNER_ADDITIONS.closingFollowUp)
    expect(page.closing.followUp).toContain('trusted data foundation')
    expect(buttonLabel(cell(t, 'Primary button'))).toBe(ctaLabel)
    expect(cell(t, 'Secondary link')).toBe(`${email} (\`mailto:${email}\`)`)
  })

  it('holds the owner\'s two additions A1 and A2 verbatim, and neither withdrawn proposal', () => {
    expect(Object.values(OWNER_ADDITIONS)).toEqual([
      'We help you build a trusted data foundation for reliable reporting and better decisions.',
      'We help financial institutions bring together data from banking, lending, payment and accounting systems to improve reconciliation, financial reporting and visibility into business performance.',
    ])
    expect([page.closing.followUp, page.audience.card!.detail]).toEqual(Object.values(OWNER_ADDITIONS))
    expect(WITHDRAWN).toHaveLength(2)
    const text = JSON.stringify(page)
    for (const line of WITHDRAWN) expect(text, line).not.toContain(line)
  })

  it('stores the capitalised labels in sentence case', () => {
    expect([
      page.hero.eyebrow,
      page.challenge.label,
      page.approach.label,
      ...page.promise!.groups.map((group) => group.label),
      page.assessment.eyebrow,
      page.assessment.deliverablesLabel,
      page.reconciliation!.eyebrow,
      page.closing.eyebrow,
    ]).toEqual([
      'Financial services solutions',
      'The challenge',
      'Our approach',
      'The data trust assessment',
      'After the assessment',
      'Start with trust',
      'The assessment delivers',
      'After the assessment · What we can implement',
      'Get started',
    ])
  })

  it('keeps the old h1 only as the sector\'s heading in solutions.ts', () => {
    expect(solutions.find((solution) => solution.id === 'financial-services')!.heading).toBe(
      'Financial Services Data & Analytics',
    )
    expect(JSON.stringify(page)).not.toContain('Financial Services Data & Analytics')
  })

  it('has digits only in "3 exceptions", and no figures, products or compliance claims', () => {
    const text = JSON.stringify({ ...page, title: undefined, description: undefined })
    expect(text.match(/\d+[^"]*/g)).toEqual(['3 exceptions'])
    expect(JSON.stringify(page)).not.toMatch(
      /Fafanua Intelligence|AI-powered|Reverse ETL|compliant|certified|certification|guarantee|meets the requirements of|regulatory compliance|in line with the/i,
    )
    // "compliance" only in the plan's handling item.
    expect(JSON.stringify(page).match(/complian/gi)).toHaveLength(1)
    expect(page.handling.items[2]).toBe('We work alongside your risk, compliance and internal audit teams, not around them.')
  })

  it('names no regulator or supervisor (plan section 3)', () => {
    expect(JSON.stringify(page)).not.toMatch(FORBIDDEN_TERMS)
  })
})

describe('old Financial Services strings', () => {
  // The page's copy before #98: its title, description, lead, context,
  // problems, service links and texts, governance and activation. The
  // solutions.ts heading, summary and themes stay (homepage data), so
  // their wording is not listed.
  const OLD = [
    'Financial Services & Banking Analytics Uganda | Fafanua',
    'Data engineering, reconciliation and business intelligence for banks, SACCOs, microfinance institutions, fintechs and insurers in Uganda and East Africa.',
    'For banks, SACCOs, microfinance institutions, fintechs, payment processors and insurers.',
    'Financial institutions run on many systems at once',
    'Fafanua helps banks, SACCOs and microfinance institutions in Uganda and East Africa build the trusted data foundation behind that reporting',
    'Customer and transaction data fragmented across core banking, mobile-money and payment platforms.',
    'Portfolio monitoring that relies on monthly extracts rather than current data.',
    'Payment and revenue reconciliation done by hand in spreadsheets.',
    'Revenue leakage that stays hidden while channels do not reconcile.',
    'Regulatory returns assembled manually from several systems each period.',
    'Limited customer segmentation, because customer records are not linked across products.',
    'Payment and core-system integration',
    'Connect core banking, loan-management, mobile-money, payment and CRM systems with monitored pipelines.',
    'Portfolio and customer data models',
    'Model loans, accounts, customers and transactions consistently, with their history preserved.',
    'Payment reconciliation controls',
    'Automated reconciliation between channels, switches and the ledger, with exceptions surfaced every day.',
    'Financial data governance',
    'Ownership, definitions and access policies for customer and financial data.',
    'Banking and portfolio dashboards',
    'Credit portfolio, risk-monitoring and management dashboards, and financial reporting automation.',
    'Reconciliation tolerances and exception workflows agreed with finance.',
    'Consistent definitions of active customers, portfolio at risk and other key measures.',
    'Classification and access controls for personal and financial data.',
    'Lineage from regulatory figures back to the source transactions.',
    'Pushing customer segments and product eligibility into CRM and engagement tools.',
    'Sharing arrears and risk flags with collections and relationship teams.',
    'Exposing trusted portfolio metrics inside operational applications.',
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
