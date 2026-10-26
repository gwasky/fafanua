// Checks the Education page's entry in solutionPages.ts against section 4
// of _docs/fafanua-education-landing-page-plan.md (issue 100), so its wording
// cannot drift from the plan: every string character for character, the
// labels the plan writes in capitals compared in upper case (CSS shows
// them so), the "; " and "Name: text" splits, the diagram's solid and
// dashed sources (plan section 5), the learner journey, the title and
// description, the figure's accessible description (plan section 6), the
// owner's A1 and A2 and other decisions (2026-10-26), each recorded in
// the plan as an owner update, and the strings proposed to carry them
// out. It also checks that the old Education strings are gone from src/,
// the naming and claims rules (plan section 3), that the assessment
// claims no implementation work, and that the call to action and address
// come from contact.ts.
import { describe, expect, it } from 'vitest'
import {
  buttonLabel,
  cell,
  COMPLIANCE_TERMS,
  copySection,
  DASHED_SOURCES,
  DESCRIPTION,
  figureDescription,
  handlingItems,
  HIGHLIGHT_NOTE,
  list,
  marked,
  named,
  NAMING_TERMS,
  OWNER_ADDITIONS,
  OWNER_DECISIONS,
  PROPOSALS,
  SOLID_SOURCES,
  tables,
  TITLE,
} from '../test/educationPlan.ts'
import { ctaLabel, email } from './contact.ts'
import { solutionPages, type SectorLandingPage } from './solutionPages.ts'
import { solutions } from './solutions.ts'

const entry = solutionPages.education
if (entry.layout !== 'sector') throw new Error('Education is not on the shared foundation')
const page: SectorLandingPage = entry
const journey = page.journey!
const upper = (text: string) => text.toUpperCase()

// The PM's first proposals for A1 and A2 (issue 100), replaced by the owner's
// own copy on 2026-10-26, and the plan's handling item the owner
// replaced.
const WITHDRAWN = [
  'We help you build a trusted data foundation for reliable reporting and better decisions.',
  'We help education institutions bring together data from admissions, learning, exams and finance systems for learner analytics, education dashboards and a clearer view of retention and graduate outcomes.',
  'Records of learners under 18 get extra care, with access limited to named roles.',
] as const

describe('Education plan section 4 parser', () => {
  it('finds the nine copy tables and the removed list in order', () => {
    expect([...tables.keys()]).toEqual([
      'Hero',
      'Trace diagram',
      'Challenge and approach',
      'Who we work with',
      'The Data Trust Assessment',
      'One learner, one record',
      'AI and responsible handling',
      'After the assessment',
      'Closing panel',
      'Removed from the current Education page',
    ])
  })
})

describe('Education copy (plan section 4)', () => {
  it('has the issue\'s title and description, with the assigned keywords and the protected phrase', () => {
    expect(page.title).toBe(TITLE)
    expect(page.description).toBe(DESCRIPTION)
    expect(page.title).toHaveLength(51)
    expect(page.description).toHaveLength(161)
    expect(page.title).toContain('Education Data Analytics Uganda')
    expect(page.description).toContain('trusted data foundation')
    expect(page.description).toContain('education data analytics')
    expect(page.description).toContain('Uganda')
    expect(page.description.startsWith(`${page.hero.heading.replace(/\.$/, '')}: `)).toBe(true)
  })

  it('uses the hero\'s breadcrumb, eyebrow, heading, lead and buttons', () => {
    expect(cell('Hero', 'Breadcrumb').split(' › ')).toEqual(['Home', 'Solutions', page.breadcrumb])
    expect(upper(page.hero.eyebrow)).toBe(cell('Hero', 'Eyebrow'))
    expect(page.hero.eyebrow).toBe('Education solutions')
    expect(page.hero.heading).toBe(cell('Hero', 'Heading (`h1`)'))
    expect(page.hero.lead).toBe(cell('Hero', 'Lead'))
    expect(page.hero.leadDetail).toBeUndefined()
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
    expect(d.figures.map((figure) => figure.marker)).toEqual(['amber', 'teal', 'hollow'])
    expect(d.caption).toBe(cell('Trace diagram', 'Caption'))
    expect(d.description).toBe(figureDescription)
    expect(d.description).toBe(
      'Illustrative example: active learners, fee collection rate and completion rate traced to student, learning and finance systems, with trust ratings.',
    )
  })

  it('feeds the figures from the three sources plan section 5 draws solid, with its icons', () => {
    expect(SOLID_SOURCES).toEqual(['Student information system', 'Learning platform', 'Fees & finance'])
    expect(DASHED_SOURCES).toEqual(['Admissions', 'Exams & grading'])
    expect(page.diagram.sources.filter((source) => source.feeds).map((source) => source.label)).toEqual(SOLID_SOURCES)
    expect(page.diagram.sources.filter((source) => !source.feeds).map((source) => source.label)).toEqual(DASHED_SOURCES)
    expect(page.diagram.sources.map((source) => [source.label, source.icon, source.feeds])).toEqual([
      ['Admissions', 'list', false],
      ['Exams & grading', 'score', false],
      ['Student information system', 'cap', true],
      ['Learning platform', 'chart', true],
      ['Fees & finance', 'card', true],
    ])
  })

  it('uses the challenge and approach cards, with their curly quotes', () => {
    const t = 'Challenge and approach'
    expect(page.challenge.heading).toBe(cell(t, 'Card 1 heading'))
    expect(page.challenge.text).toBe(cell(t, 'Card 1 text'))
    expect(page.approach.heading).toBe(cell(t, 'Card 2 heading'))
    expect(page.approach.text).toBe(cell(t, 'Card 2 text'))
    expect(page.challenge.text).toContain('‘active’')
    expect(page.approach.text).toContain('learner’s')
    for (const card of [page.challenge, page.approach]) {
      expect(card.label).toBeUndefined()
      expect(card.detail).toBeUndefined()
    }
    expect([page.challenge.icon, page.approach.icon]).toEqual(['alert', 'check'])
  })

  it('uses Who we work with: its card, the owner\'s A2 and four plain checklist items', () => {
    const t = 'Who we work with'
    expect(page.audience.heading).toBe(cell(t, 'Heading'))
    expect(page.audience.subheading).toBe(cell(t, 'Subheading'))
    expect(page.audience.card.heading).toBe(cell(t, 'Card heading'))
    expect(page.audience.card.text).toBe(cell(t, 'Card text'))
    expect(page.audience.card.detail).toBe(OWNER_ADDITIONS.audienceDetail)
    expect(page.audience.card.itemsLabel).toBeUndefined()
    expect(page.audience.card.itemsLayout).toBeUndefined()
    expect(page.audience.card.items).toEqual(list(cell(t, 'Checklist')))
    for (const item of page.audience.card.items) expect(typeof item).toBe('string')
    expect(page.audience.card.icon).toBe('cap')
  })

  it('uses the Data Trust Assessment\'s eyebrow, heading, text and deliverables (no full stops, no label)', () => {
    const t = 'The Data Trust Assessment'
    expect(upper(page.assessment.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(page.assessment.heading).toBe(cell(t, 'Heading'))
    expect(page.assessment.text).toBe(cell(t, 'Text'))
    expect(page.assessment.deliverablesLabel).toBeUndefined()
    expect(page.assessment.deliverables.map(({ name, text }) => ({ name, text }))).toEqual(
      [1, 2, 3, 4].map((n) => named(cell(t, `Deliverable ${n}`))),
    )
    for (const { text } of page.assessment.deliverables) expect(text).not.toMatch(/\.$/)
    expect(page.assessment.deliverables[2].text).toContain('‘active learner’')
    expect(page.assessment.deliverables.map((item) => item.icon)).toEqual(['map', 'score', 'book', 'list'])
    expect(page.assessment.deliverables.map((item) => item.name)).not.toContain('Fix list')
  })

  it('keeps implementation work out of the assessment (owner principle)', () => {
    expect(JSON.stringify(page.assessment)).not.toMatch(/connect|integrat|reconcil|pipeline|dashboard|build/i)
  })

  it('uses the learner journey: eyebrow, heading, text, five "Name: System" steps in order, Learn highlighted, the callout and the caption', () => {
    const t = 'One learner, one record'
    expect(upper(journey.eyebrow)).toBe(cell(t, 'Eyebrow'))
    expect(journey.heading).toBe(cell(t, 'Heading'))
    expect(journey.text).toBe(cell(t, 'Text'))
    expect(journey.steps).toEqual(
      list(cell(t, 'Journey steps, in order')).map(named).map(({ name, text }) => ({ name, system: text })),
    )
    expect(journey.steps.map((step) => step.name)).toEqual(['Apply', 'Enrol', 'Learn', 'Assess', 'Complete'])
    // "and", as the plan writes it, unlike the diagram's "&".
    expect(journey.steps[3].system).toBe('Exams and grading')
    expect(journey.highlight).toBe(2)
    expect(journey.steps[journey.highlight].name).toBe('Learn')
    expect(journey.highlightNote).toBe(HIGHLIGHT_NOTE)
    expect(upper(journey.callout.label)).toBe(cell(t, 'Callout label'))
    expect(journey.callout.label).toBe('Definition agreed')
    expect(journey.callout.text).toBe(cell(t, 'Callout text'))
    expect(journey.caption).toBe(cell(t, 'Caption'))
    // The definition is always labelled as a sample (plan section 3).
    expect(journey.caption).toBe('Illustrative example. Sample definition only.')
  })

  it('places the journey after the assessment, under the owner\'s "What happens next", with the proposed opening sentence (issue 100)', () => {
    expect(journey.eyebrowLead).toBe(OWNER_DECISIONS.journeyEyebrowLead)
    expect(journey.eyebrowLead).toBe('What happens next')
    expect(journey.intro).toBe(PROPOSALS.journeyIntro)
    // Both recorded in the plan's owner update for the section.
    expect(copySection).toContain(`"${OWNER_DECISIONS.journeyEyebrowLead}" before "${journey.eyebrow}"`)
    expect(copySection).toContain(`"${PROPOSALS.journeyIntro}"`)
    expect(`${journey.intro} ${journey.text}`).not.toMatch(COMPLIANCE_TERMS)
  })

  it('uses the AI card, its chips and the Handled responsibly checklist (with full stops), with the owner\'s new item', () => {
    const t = 'AI and responsible handling'
    expect(page.ai.heading).toBe(cell(t, 'Card 1 heading'))
    expect(page.ai.text).toBe(cell(t, 'Card 1 text'))
    expect(page.ai.chips).toEqual(
      list(cell(t, 'Card 1 chips')).map(marked).map(({ name, marker }) => ({ label: name, marker })),
    )
    expect(page.handling.heading).toBe(cell(t, 'Card 2 heading'))
    expect(page.handling.items).toEqual(handlingItems(cell(t, 'Card 2 checklist')))
    expect(page.handling.items).toEqual([
      'Learner data is pseudonymised wherever the analysis allows.',
      'Education data can be sensitive, particularly where it relates to children and young people. We design access, governance and reporting controls around the organisation’s policies, legal obligations and the sensitivity of the data.',
      'Ownership and access rules are agreed before any pipeline is built.',
    ])
    for (const item of page.handling.items) expect(item).toMatch(/\.$/)
    expect([page.ai.icon, page.handling.icon]).toEqual(['gauge', 'shield'])
  })

  it('uses After the assessment: its subheading, the plan\'s three service cards with no lead or detail, then the two restored links (issue 100)', () => {
    const t = 'After the assessment'
    expect(page.services.heading).toBe(cell(t, 'Heading'))
    expect(page.services.subheading).toBe(cell(t, 'Subheading'))
    expect(page.services.leadTone).toBeUndefined()
    const plan = [1, 2, 3].map((n) => named(cell(t, `Card ${n}`)))
    expect(page.services.items.slice(0, 3).map(({ name, text }) => ({ name, text }))).toEqual(plan)
    expect(page.services.items.slice(3)).toEqual(PROPOSALS.services)
    for (const item of page.services.items) {
      expect(item.lead).toBeUndefined()
      expect(item.detail).toBeUndefined()
    }
    expect(page.services.items.map((item) => [item.icon, item.service])).toEqual([
      ['link', 'data-engineering-and-integration'],
      ['shield', 'data-quality-and-reliability'],
      ['chart', 'business-intelligence-and-analytics'],
      ['ledger', 'data-warehousing-and-analytics-modelling'],
      ['book', 'data-governance-and-metadata'],
    ])
    for (const { name, text } of PROPOSALS.services) expect(copySection).toContain(`"${name}: ${text}"`)
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

  it('holds the owner\'s A1 and A2 verbatim, each recorded in the plan, and none of the withdrawn strings', () => {
    expect(Object.values(OWNER_ADDITIONS)).toEqual([
      'We help education organisations build a trusted data foundation for reliable reporting, clearer learner journeys and better decisions.',
      'We help education institutions bring together data from admissions, learning, exams and finance systems for learner analytics, education dashboards and cohort analysis — giving teams a clearer view of student retention, learner progression and graduate outcomes.',
    ])
    expect([page.closing.followUp, page.audience.card.detail]).toEqual(Object.values(OWNER_ADDITIONS))
    for (const text of Object.values(OWNER_ADDITIONS)) expect(copySection).toContain(`"${text}"`)
    expect(WITHDRAWN).toHaveLength(3)
    const text = JSON.stringify(page)
    for (const line of WITHDRAWN) expect(text, line).not.toContain(line)
    expect(text).not.toMatch(/under 18/)
  })

  it('stores the capitalised labels in sentence case', () => {
    expect([
      page.hero.eyebrow,
      page.assessment.eyebrow,
      journey.eyebrowLead,
      journey.eyebrow,
      journey.callout.label,
      page.closing.eyebrow,
    ]).toEqual(['Education solutions', 'Start with trust', 'What happens next', 'One learner, one record', 'Definition agreed', 'Get started'])
  })

  it('keeps every curly quote and both ampersands as the plan writes them', () => {
    const text = JSON.stringify(page)
    expect(text.match(/‘/g)).toHaveLength(2)
    expect(text.match(/’/g)).toHaveLength(4)
    expect(text).not.toMatch(/[A-Za-z]'[a-z]/)
    expect(page.diagram.sources.map((source) => source.label)).toEqual(
      expect.arrayContaining(['Exams & grading', 'Fees & finance']),
    )
  })

  it('has no Delivered in stages, promise strip or reconciliation', () => {
    for (const field of ['stages', 'promise', 'reconciliation']) expect(page).not.toHaveProperty(field)
    expect(JSON.stringify(page)).not.toMatch(/Delivered in stages|Moves on when|"Stage"/)
  })

  it('keeps the old h1 only as the sector\'s heading in solutions.ts', () => {
    expect(solutions.find((solution) => solution.id === 'education')!.heading).toBe('Education Data & Analytics')
    expect(JSON.stringify(page)).not.toContain('Education Data & Analytics')
  })

  it('has digits only in "30", and no figures, products or compliance claims', () => {
    const text = JSON.stringify({ ...page, title: undefined, description: undefined, highlight: undefined, journey: { ...journey, highlight: undefined } })
    expect(text.match(/\d+/g)).toEqual(['30'])
    expect(JSON.stringify(page)).not.toMatch(/Fafanua Intelligence|AI-powered|Reverse ETL/i)
    // The plan's Complete step names its system "Certification records",
    // a kind of record, not a claim: the only "certification", once.
    expect(JSON.stringify(page).match(/certification/gi)).toEqual(['Certification'])
    expect(journey.steps[4].system).toBe('Certification records')
    expect(JSON.stringify(page).replace('Certification records', '')).not.toMatch(COMPLIANCE_TERMS)
  })

  it('names no institution, ministry, funder or examination body (plan section 3)', () => {
    const strings = JSON.stringify(page)
    expect(strings).not.toMatch(NAMING_TERMS)
    // No acronym: no run of three or more capital letters, apart from the
    // AI card's "AI" (two letters) and the protected title's words.
    expect(strings).not.toMatch(/[A-Z]{3,}/)
  })
})

describe('old Education strings', () => {
  // The page's copy before issue 100: its description, lead, context, problems,
  // service links and texts, governance and activation. The old title is
  // a part of the new one, so it is checked by value. The solutions.ts
  // heading, summary and themes stay (homepage data), so their wording is
  // not listed.
  const OLD = [
    'Learner, enrolment and progression analytics for universities, colleges, schools and education programmes in Uganda and East Africa.',
    'For universities, colleges, school networks and education programmes.',
    'Education institutions and programmes hold learner data across admissions',
    'Fafanua helps education organisations in Uganda and East Africa build a trusted data foundation that links learner records',
    'Learner records duplicated or inconsistent across admissions, academic and finance systems.',
    'Enrolment and progression figures that differ between departments.',
    'Fee and payment status checked by hand before registration or examinations.',
    'Retention and drop-out risks identified too late to act on.',
    'Little visibility of graduate or programme outcomes.',
    'Student-system integration',
    'Connect admissions, student-information, learning-management and payment systems.',
    'Learner lifecycle data models',
    'Model learners, programmes, cohorts and terms, so progression can be followed over time.',
    'Education data governance',
    'Ownership, definitions and access rules for learner and staff data.',
    "label: 'Education dashboards'",
    'Enrolment, progression, cohort and programme-performance reporting.',
    'Consistent learner identifiers across systems.',
    'Agreed definitions of enrolment, progression, completion and retention.',
    'Access controls for personal learner data.',
    'Synchronising learner lifecycle and payment status with student services and communication tools.',
    'Flagging learners at risk of dropping out to academic advisers.',
    'Sharing cohort progress with programme teams.',
  ]

  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', { query: '?raw', import: 'default', eager: true }),
  ).filter(([file]) => !/\.test\.tsx?$/.test(file))

  it.each(OLD)('no source file holds "%s"', (text) => {
    expect(sources.map(([file]) => file)).toContain('/src/data/solutionPages.ts')
    for (const [file, source] of sources) expect(source.includes(text), file).toBe(false)
  })

  it('has a new title, and none of the old §18 fields on the entry', () => {
    expect(page.title).not.toBe('Education Data Analytics Uganda | Fafanua')
    for (const field of ['lead', 'context', 'audiences', 'problems', 'governance', 'activation']) {
      expect(page).not.toHaveProperty(field)
    }
  })
})
