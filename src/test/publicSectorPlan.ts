// Section 4 of _docs/fafanua-public-sector-landing-page-plan.md (#93),
// parsed into the Public Sector page's copy, for the tests that check the
// data and the rendered page against it. The ?raw import resolves relative
// to this file and is never part of the production bundle.
import planSource from '../../_docs/fafanua-public-sector-landing-page-plan.md?raw'
import { named, parseLandingPlan } from './landingPlan.ts'

export { buttonLabel, list, marked, named } from './landingPlan.ts'

export const { copySection, tables, cell, figureDescription } = parseLandingPlan(planSource)

/** A stage: "Name: description. Moves on when: condition". */
export function stage(text: string) {
  const { name, text: rest } = named(text)
  const [description, exit] = rest.split(' Moves on when: ')
  return { name, description, exit }
}

/** The title and description the issue fixes (#93, section 1). */
export const TITLE = 'Accountable Government Data Analytics Uganda | Fafanua'
export const DESCRIPTION =
  'Public data you can account for: public sector data analytics for ministries, agencies and local governments in Uganda, built on a trusted data foundation.'

/**
 * The owner's additions to the plan copy (2026-10-23, #93), exactly as
 * approved for review: four lines carrying the SEO plan §12 keywords the
 * plan copy had dropped, and the closing panel's follow-up sentence,
 * which makes the protected "trusted data foundation" visible.
 */
export const OWNER_ADDITIONS = {
  audienceDetail: 'We work with the government data systems your institution already runs in Uganda.',
  integrateDetail: 'Government data integration in Uganda, into one public sector data warehouse.',
  governanceDetail: 'Government data governance that your departments can keep up.',
  reportingDetail:
    'Government dashboards in Uganda, from service delivery dashboards and institutional performance dashboards to government reporting automation.',
  closingFollowUp: 'Then we make sure they are built on a trusted data foundation.',
} as const

/** The eight SEO plan §12 keywords the owner asked to restore, each as
 * it appears in the additions ("Uganda" may follow a few words later). */
export const RESTORED_KEYWORDS: readonly [string, RegExp][] = [
  ['government data systems Uganda', /government data systems [\w ]*Uganda/i],
  ['government data integration Uganda', /government data integration in Uganda/i],
  ['government dashboards Uganda', /government dashboards in Uganda/i],
  ['government data governance', /government data governance/i],
  ['service delivery dashboards', /service delivery dashboards/i],
  ['institutional performance dashboards', /institutional performance dashboards/i],
  ['public sector data warehouse', /public sector data warehouse/i],
  ['government reporting automation', /government reporting automation/i],
]
