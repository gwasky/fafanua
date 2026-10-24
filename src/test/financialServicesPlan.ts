// Section 4 of _docs/fafanua-financial-services-landing-page-plan.md
// (#98), parsed into the Financial Services page's copy, for the tests
// that check the data and the rendered page against it. The ?raw import
// resolves relative to this file and is never part of the production
// bundle.
import planSource from '../../_docs/fafanua-financial-services-landing-page-plan.md?raw'
import { parseLandingPlan } from './landingPlan.ts'

export { buttonLabel, list, marked, named } from './landingPlan.ts'

export const { copySection, tables, cell, figureDescription } = parseLandingPlan(planSource)

/** The title and description the issue fixes (#98, section 1). */
export const TITLE = 'Reconciliation & Banking Analytics Uganda | Fafanua'
export const DESCRIPTION =
  'Financial figures you can reconcile: financial services analytics for banks, microfinance institutions, SACCOs and insurers in Uganda, on a trusted data foundation.'

/**
 * The proposed additions to the plan copy (2026-10-24, #98), pending the
 * owner's review: [A1] the closing panel's follow-up sentence, which makes
 * the protected "trusted data foundation" visible, and [A2] the
 * Financial institutions card's second paragraph, which carries the SEO
 * plan §7 keywords the plan copy dropped and the page's only visible
 * "Uganda".
 */
export const OWNER_ADDITIONS = {
  closingFollowUp: 'Then we make sure your reports are built on a trusted data foundation.',
  audienceDetail:
    'In Uganda and East Africa, that includes banking analytics, payment and revenue reconciliation, and financial reporting automation.',
} as const

/** A reconciliation card cell, "Record; compared with Source; status
 * Status (teal check)" or "(amber alert)". */
export function comparison(text: string) {
  const match = text.match(/^(.+?); compared with (.+?); status (.+) \((teal check|amber alert)\)$/)
  if (!match) throw new Error(`Cannot read "${text}"`)
  return {
    record: match[1],
    source: match[2],
    status: match[3],
    statusIcon: match[4] === 'teal check' ? ('check' as const) : ('alert' as const),
  }
}

/** Generic terms that would point at a specific regulator or supervisor
 * (plan section 3), which the page and its data never hold; the plan's
 * generic "regulators" and "regulatory reports" are allowed. No
 * institution is named here either. */
export const FORBIDDEN_TERMS =
  /central bank|regulatory authority|supervisory authority|monetary authority|markets authority|\bAct\b|Regulations?\b|\bstatute|\blicensee/i
