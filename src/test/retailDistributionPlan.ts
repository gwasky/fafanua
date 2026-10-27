// Section 4 of _docs/fafanua-retail-distribution-landing-page-plan.md
// (issue 101), parsed into the Retail & Distribution page's copy, for the
// tests that check the data and the rendered page against it. The ?raw
// import resolves relative to this file and is never part of the
// production bundle.
import planSource from '../../_docs/fafanua-retail-distribution-landing-page-plan.md?raw'
import { parseLandingPlan } from './landingPlan.ts'

export { buttonLabel, list, marked, named } from './landingPlan.ts'

export const { copySection, tables, cell, figureDescription } = parseLandingPlan(planSource)

/** Plan section 5's connector split: the sources drawn with solid teal
 * connectors (they feed the figures), and those with faint dashed ones
 * (faded). The plan writes both lists with a comma before "and". */
const connectors = (kind: string, end: string) =>
  planSource
    .match(new RegExp(`\\*\\*${kind} connectors\\*\\* link (.+?)${end}`))![1]
    .split(/,? and |, /)
export const SOLID_SOURCES = connectors('Solid teal', ' to the middle box')
export const DASHED_SOURCES = connectors('Faint dashed', '\\.')

/**
 * The title and description the issue recommends (issue 101, owner note
 * 1), pending the owner's decision: the plan's title (75 characters,
 * ending " · Fafanua") and description (212) break the length rules, so
 * these keep its keywords and wording within them.
 */
export const TITLE = 'Retail Analytics Uganda: Sales, Stock & Margin | Fafanua'
export const DESCRIPTION =
  'Retail business intelligence in Uganda and East Africa: sales analytics, inventory analytics and distribution analytics built on figures you can trace.'

/**
 * The strings the issue proposes adding to the plan copy (issue 101),
 * pending the owner's decision, each in an existing optional field: A1,
 * the closing panel's follow-up sentence, which makes the protected
 * "trusted data foundation" visible; A2, the Integrate & model card's
 * second paragraph; A3, the journey's opening sentence, so it reads as
 * work that follows the assessment.
 */
export const PROPOSED = {
  closingFollowUp:
    'We help retailers, wholesalers and distributors build a trusted data foundation, so every branch, depot and head office works from the same figures.',
  serviceDetail:
    'Payment and loyalty data can be connected too, so customer retention can be tracked and card and mobile-money takings reconcile with sales.',
  journeyIntro:
    'Where the assessment finds stock figures that do not agree, we can then help you follow each unit across the systems that record it.',
} as const

/** The visually hidden note after the highlighted step (owner note 6),
 * the counterpart of Education's. */
export const HIGHLIGHT_NOTE = '(variance shown below)'

/** A segment cell, "Heading / description / item; item; item". */
export function segment(text: string) {
  const [heading, description, items] = text.split(' / ')
  return { heading, text: description, items: items.split('; ') }
}

/** The handling checklist's items: the cell split after each full stop
 * that ends an item. */
export const handlingItems = (text: string) => text.split(/(?<=\.); /)

/** Words that would claim compliance or name a law or regulator (plan
 * section 3, issue 101 section 1). */
export const COMPLIANCE_TERMS =
  /complian|certified|certification|accredit|guarantee|make sure|meets the requirements of|in line with|regulation|regulator|data protection act/i

/** Words that would point at a specific business (plan section 3),
 * checked without naming any. */
export const NAMING_TERMS = /Supermarket [A-Z]|\bLtd\b|Limited|\bGroup\b|Holdings|\bStores\b|\bMart\b/

/** The section 7 terms the page's visible copy carries (plan section 7,
 * item 2), case-insensitively. */
export const SECTION_7_TERMS = [
  'retail analytics',
  'retail business intelligence',
  'sales analytics',
  'inventory analytics',
  'distribution analytics',
  'branch performance',
  'stock accuracy',
  'demand forecasting',
] as const
