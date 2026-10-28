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
 * The owner's title and description (2026-10-27, issue 101), recorded in
 * the plan's section 4 as an owner update: the plan's own title (75
 * characters, ending " · Fafanua") and description (212) broke the
 * length rules.
 */
export const TITLE = 'Retail & Distribution Data Analytics Uganda | Fafanua'
export const DESCRIPTION =
  'Retailers, wholesalers, distributors and FMCG businesses in Uganda and East Africa: build a trusted data foundation for sales, stock, margin and distribution analytics.'

/** The owner's closing follow-up (proposed 2026-10-27, approved with an
 * edit 2026-10-28, issue 101), recorded in the plan's section 4: it keeps
 * "trusted data foundation" visible without repeating the heading. */
export const FOLLOW_UP =
  'We help retail and distribution businesses build a trusted data foundation across branches, depots and head office.'

/**
 * The strings the issue proposed adding (A1 to A3), its recommended
 * title and description, and the two handling items the owner replaced,
 * all withdrawn on 2026-10-27 (issue 101): none is on the page. The owner's
 * replacements for A2 and A3 are already plan copy (the hero's first lead
 * and What happens next's supporting line), so they are not repeated.
 */
export const WITHDRAWN = [
  'We help retailers, wholesalers and distributors build a trusted data foundation, so every branch, depot and head office works from the same figures.',
  'Payment and loyalty data can be connected too, so customer retention can be tracked and card and mobile-money takings reconcile with sales.',
  'Where the assessment finds stock figures that do not agree, we can then help you follow each unit across the systems that record it.',
  'Retail Analytics Uganda: Sales, Stock & Margin | Fafanua',
  'Retail business intelligence in Uganda and East Africa: sales analytics, inventory analytics and distribution analytics built on figures you can trace.',
  'Access follows your existing roles, by branch and by function.',
  'Ownership and access rules are agreed before any pipeline is built.',
] as const

/** The owner's other decisions (2026-10-27, issue 101), each recorded in
 * the plan's section 4: the A2 and A3 replacements, which are plan copy,
 * and the fourth service card, which links the data warehousing page. */
export const OWNER_DECISIONS = {
  sectorStatement:
    'Fafanua helps retailers, wholesalers, distributors and FMCG businesses in Uganda and East Africa build trusted retail analytics across sales, inventory, margin and distribution performance.',
  assessmentLine:
    'The assessment shows where trust breaks down and what matters most. From there, Fafanua can strengthen the parts of your retail data foundation that need attention.',
  service: {
    name: 'Retail data warehouse',
    text: 'Model products, outlets, stock movements and sales in one data warehouse, so margin and stock can be tracked over time.',
    icon: 'ledger',
    service: 'data-warehousing-and-analytics-modelling',
  },
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
