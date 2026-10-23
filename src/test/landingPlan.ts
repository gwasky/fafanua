// A landing-page plan's section 4 (copy), parsed for the tests that check
// a page's data and rendering against it (#93, #94): the Public Sector
// and Health plans write their copy the same way, as `### Name`
// subsections of `| Element | Text |` tables, and section 4 ends where
// section 5 begins.

export type LandingPlan = {
  readonly copySection: string
  /** Each `### Name` subsection's `| Element | Text |` rows, in order. */
  readonly tables: ReadonlyMap<string, ReadonlyMap<string, string>>
  /** A cell, failing if the plan has no such row. */
  readonly cell: (table: string, element: string) => string
  /** The figure's accessible description, the plan's "For example" text. */
  readonly figureDescription: string
}

export function parseLandingPlan(source: string): LandingPlan {
  const plan = source.replace(/\r\n/g, '\n')
  const start = plan.indexOf('\n## 4. Copy\n')
  const end = plan.indexOf('\n## 5. ', start)
  if (start < 0 || end < 0) throw new Error('No section 4 in the plan')
  const copySection = plan.slice(start, end)
  const tables = new Map(
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
  const cell = (table: string, element: string) => {
    const text = tables.get(table)?.get(element)
    if (text === undefined) throw new Error(`No "${element}" row in "${table}"`)
    return text
  }
  return { copySection, tables, cell, figureDescription: plan.match(/For example: "([^"]+)"/)![1] }
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
