// Section 4 of _docs/fafanua-public-sector-landing-page-plan.md (#93),
// parsed into the Public Sector page's copy, for the tests that check the
// data and the rendered page against it. The ?raw import resolves relative
// to this file and is never part of the production bundle.
import planSource from '../../_docs/fafanua-public-sector-landing-page-plan.md?raw'

const plan = planSource.replace(/\r\n/g, '\n')
const start = plan.indexOf('\n## 4. Copy\n')
const end = plan.indexOf('\n## 5. Layout\n')
export const copySection = plan.slice(start, end)

/** Each `### Name` subsection's `| Element | Text |` rows, in order. */
export const tables = new Map(
  copySection
    .split('\n### ')
    .slice(1)
    .map((part) => {
      const [name, ...lines] = part.split('\n')
      const rows = new Map(
        [...lines.join('\n').matchAll(/^\| (.+?) \| (.+?) \|$/gm)]
          .filter((row) => row[1] !== 'Element' && !/^-+$/.test(row[1]))
          .map((row) => [row[1], row[2]]),
      )
      return [name, rows] as const
    }),
)

/** A cell, failing if the plan has no such row. */
export function cell(table: string, element: string): string {
  const text = tables.get(table)?.get(element)
  if (text === undefined) throw new Error(`No "${element}" row in "${table}"`)
  return text
}

/** A "Name: text" entry, split at the first ": ". */
export function named(text: string) {
  const at = text.indexOf(': ')
  return { name: text.slice(0, at), text: text.slice(at + 2) }
}

/** A list cell, split at "; ". */
export const list = (text: string) => text.split('; ')

/** A button cell, "Label → (`href`)" or "Label (jumps to ...)": the label. */
export const buttonLabel = (text: string) => text.replace(/ (→ )?\(.*\)$/, '')

/** A marker as the plan names it: "(amber dot)" and so on. */
const MARKERS = { teal: 'teal', amber: 'amber', hollow: 'hollow' } as const

/** "Name, Rating (colour dot)" or "Label (colour dot)" entries. */
export function marked(text: string) {
  const match = text.match(/^(.+?)(?:, (.+))? \((teal|amber|hollow) dot\)$/)
  if (!match) throw new Error(`Cannot read "${text}"`)
  return { name: match[1], rating: match[2], marker: MARKERS[match[3] as keyof typeof MARKERS] }
}

/** A stage: "Name: description. Moves on when: condition". */
export function stage(text: string) {
  const { name, text: rest } = named(text)
  const [description, exit] = rest.split(' Moves on when: ')
  return { name, description, exit }
}

/** The figure's accessible description, plan section 6's example. */
export const figureDescription = plan.match(/For example: "([^"]+)"/)![1]

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
