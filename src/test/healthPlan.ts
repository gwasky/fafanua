// Section 4 of _docs/fafanua-health-landing-page-plan.md (#94), parsed
// into the Health page's copy, for the tests that check the data and the
// rendered page against it. The ?raw import resolves relative to this
// file and is never part of the production bundle.
import planSource from '../../_docs/fafanua-health-landing-page-plan.md?raw'
import { parseLandingPlan } from './landingPlan.ts'

export { buttonLabel, list, marked, named } from './landingPlan.ts'

export const { copySection, tables, cell, figureDescription } = parseLandingPlan(planSource)

/** The title and description the issue fixes (#94, section 1). */
export const TITLE = 'Traceable Health Data Analytics Uganda | Fafanua'
export const DESCRIPTION =
  'Health data you can trace: healthcare analytics for hospitals and clinic networks in Uganda and East Africa, built on a trusted data foundation.'

/**
 * The owner's additions to the plan copy (2026-10-23, #94), exactly as
 * listed for review: four lines carrying the SEO plan §9 keywords the
 * removed sections carried, and the closing panel's follow-up sentence
 * (the one approved for Public Sector), which makes the protected
 * "trusted data foundation" visible.
 */
export const OWNER_ADDITIONS = {
  audienceDetail:
    'We work with the health information systems your organisation already runs in Uganda, including those behind pharmacy analytics, medical inventory analytics and health supply chain analytics.',
  integrateDetail:
    'Health systems integration in Uganda, with health systems interoperability through APIs and health data exchange, into one health data warehouse.',
  governanceDetail:
    'Health data quality and health data governance in Uganda, with a health data quality framework your branches can keep up.',
  reportingDetail:
    'Healthcare analytics in Uganda and East Africa, from health facility performance dashboards and facility utilisation analytics to patient flow analytics and health service delivery analytics.',
  closingFollowUp: 'Then we make sure they are built on a trusted data foundation.',
} as const

/** The SEO plan §9 keywords the additions carry back (issue #94, "SEO
 * findings"), each as it appears there ("Uganda" may follow a few words
 * later). */
export const RESTORED_KEYWORDS: readonly [string, RegExp][] = [
  ['health information systems Uganda', /health information systems [\w ]*Uganda/i],
  ['pharmacy analytics Uganda', /pharmacy analytics/i],
  ['medical inventory analytics', /medical inventory analytics/i],
  ['health supply chain analytics Uganda', /health supply chain analytics/i],
  ['health systems integration Uganda', /health systems integration in Uganda/i],
  ['health systems interoperability', /health systems interoperability/i],
  ['health data exchange Uganda', /health data exchange/i],
  ['health data warehouse Uganda', /health data warehouse/i],
  ['health API integration', /through APIs/i],
  ['health data quality Uganda', /health data quality and health data governance in Uganda/i],
  ['health data governance Uganda', /health data governance in Uganda/i],
  ['health data quality framework', /health data quality framework/i],
  ['healthcare analytics Uganda', /healthcare analytics in Uganda/i],
  ['healthcare analytics East Africa', /healthcare analytics in Uganda and East Africa/i],
  ['health facility performance dashboard', /health facility performance dashboards/i],
  ['facility utilisation analytics', /facility utilisation analytics/i],
  ['patient flow analytics', /patient flow analytics/i],
  ['health service delivery analytics', /health service delivery analytics/i],
]
