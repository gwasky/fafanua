// Section 4 of _docs/fafanua-education-landing-page-plan.md (#100),
// parsed into the Education page's copy, for the tests that check the
// data and the rendered page against it. The ?raw import resolves
// relative to this file and is never part of the production bundle.
import planSource from '../../_docs/fafanua-education-landing-page-plan.md?raw'
import { parseLandingPlan } from './landingPlan.ts'

export { buttonLabel, list, marked, named } from './landingPlan.ts'

export const { copySection, tables, cell, figureDescription } = parseLandingPlan(planSource)

/** Plan section 5's connector split: the sources drawn with solid teal
 * connectors (they feed the figures), and those with faint dashed ones
 * (faded). */
const connectors = (kind: string, end: string) =>
  planSource
    .match(new RegExp(`\\*\\*${kind} connectors\\*\\* link (.+?)${end}`))![1]
    .split(/,? and |, /)
export const SOLID_SOURCES = connectors('Solid teal', ' to the middle box')
export const DASHED_SOURCES = connectors('Faint dashed', '\\.')

/** The title and description the issue fixes (#100, section 1). */
export const TITLE = 'Learner & Education Data Analytics Uganda | Fafanua'
export const DESCRIPTION =
  'Every learner, counted the same way: education data analytics for universities, colleges, schools and training providers in Uganda, on a trusted data foundation.'

/**
 * The owner's additions to the plan copy (2026-10-26, #100), which
 * replaced the PM's first proposals: A1, the closing panel's follow-up
 * sentence, which makes the protected "trusted data foundation" visible,
 * and A2, the Education institutions card's second paragraph. Both are
 * recorded in the plan's section 4 as owner updates.
 */
export const OWNER_ADDITIONS = {
  closingFollowUp:
    'We help education organisations build a trusted data foundation for reliable reporting, clearer learner journeys and better decisions.',
  audienceDetail:
    'We help education institutions bring together data from admissions, learning, exams and finance systems for learner analytics, education dashboards and cohort analysis — giving teams a clearer view of student retention, learner progression and graduate outcomes.',
} as const

/**
 * The owner's other decisions (2026-10-26, #100): the learner journey's
 * eyebrow lead, which places it after the assessment, and the strings
 * proposed to carry them out, pending the owner's review: the journey's
 * opening sentence, and the two service cards that link the data
 * warehousing and data governance pages again.
 */
export const OWNER_DECISIONS = {
  journeyEyebrowLead: 'What happens next',
} as const

export const PROPOSALS = {
  journeyIntro:
    'Where the assessment identifies fragmented learner records, we can then help you unify admissions, learning, assessment, finance and outcomes data.',
  services: [
    {
      name: 'Learner data warehouse',
      text: 'Model learners, programmes, cohorts and terms in one data warehouse, so progression and completion can be followed over time.',
      icon: 'ledger',
      service: 'data-warehousing-and-analytics-modelling',
    },
    {
      name: 'Data governance and definitions',
      text: 'Agree ownership, shared definitions and access rules for learner and staff data, and keep them documented.',
      icon: 'book',
      service: 'data-governance-and-metadata',
    },
  ],
} as const

/** Plan section 6's visually hidden note after the highlighted step. */
export const HIGHLIGHT_NOTE = '(definition shown below)'

/** The handling checklist's items: the cell split after each full stop
 * that ends an item. */
export const handlingItems = (text: string) => text.split(/(?<=\.); /)

/** Words that would claim compliance or name a law (plan section 3). */
export const COMPLIANCE_TERMS =
  /complian|certified|certification|accredit|guarantee|make sure|meets the requirements of|in line with|regulation|data protection act/i

/** Words that would point at a specific body (plan section 3), checked
 * without naming any. */
export const NAMING_TERMS = /Ministry of|University of|Board of|Examinations|Council|Authority|Commission|Bureau/
