// Checks the Managed Services section's own strings in services.ts against
// plan V2 (_docs/fafanua-v2-visual-upgrade-plan.md): the heading and the
// capability rail in Section 10, and the eyebrow label in Section 9's
// numbering. The approved proposition (eyebrow, heading, description,
// capabilities and journey) is checked against the positioning doc by
// services.plan.test.ts. The grouping, the journey's name, the engagement
// label and the offers are checked against §3 of the Managed Services
// Regrouped plan (#88). The ?raw imports resolve relative to this file and
// are never part of the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/fafanua-v2-visual-upgrade-plan.md?raw'
import regroupedPlan from '../../_docs/fafanua-managed-services-regrouped-plan.md?raw'
import { managedServices } from './services.ts'

const doc = plan.replace(/\r\n/g, '\n')

// The text of top-level section `n`, from its `# n. ` heading up to the
// next `# ` heading.
function section(markdown: string, n: number): string {
  const start = markdown.indexOf(`\n# ${n}. `)
  if (start === -1) throw new Error(`Section ${n} not found`)
  const end = markdown.indexOf('\n# ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// The first bold `> ` quote after `label` in `text`.
function quoteAfter(text: string, label: string): string {
  const start = text.indexOf(label)
  if (start === -1) throw new Error(`"${label}" not found`)
  return text.slice(start).match(/^> \*\*(.+)\*\*$/m)?.[1].trim() ?? ''
}

const s10 = section(doc, 10)
const docHeading = quoteAfter(s10, 'Suggested heading:')
const docRail = quoteAfter(s10, 'Suggested capability rail:').split(' · ')
// Section 9's numbering: bold `- **NN — Label**` bullets.
const docNumbering = [
  ...section(doc, 9).matchAll(/^- \*\*(\d\d) — (.+)\*\*$/gm),
].map((match) => [match[1], match[2]])

describe('plan V2 §10 and §9 parser', () => {
  it('finds the suggested heading and a four-word rail in Section 10', () => {
    expect(docHeading).toMatch(/\.$/)
    expect(docRail).toHaveLength(4)
  })

  it('finds the four numbered sections in Section 9', () => {
    expect(docNumbering.map(([number]) => number)).toEqual(['01', '02', '03', '04'])
  })
})

describe('managedServices V2 strings', () => {
  it('uses the Section 10 heading as the section heading', () => {
    expect(managedServices.sectionHeading).toBe(docHeading)
  })

  it('uses the Section 10 capability rail, one word per item, in order, as the group headings', () => {
    expect(managedServices.groups.map((group) => group.heading)).toEqual(docRail)
  })

  it('uses the label numbered 02 in Section 9 as the eyebrow label', () => {
    expect(docNumbering[1]).toEqual(['02', managedServices.sectionLabel])
  })
})

// The Managed Services Regrouped plan's §3: the text from its `## 3. `
// heading up to the next `## ` heading, and the rows of the table under
// each `### ` sub-heading, as [first cell, second cell].
const regrouped = regroupedPlan.replace(/\r\n/g, '\n')
const r3 = (() => {
  const start = regrouped.indexOf('\n## 3. ')
  if (start === -1) throw new Error('Section 3 not found')
  return regrouped.slice(start, regrouped.indexOf('\n## ', start + 1))
})()

function tableUnder(heading: string): Map<string, string> {
  const start = r3.indexOf(`\n### ${heading}\n`)
  if (start === -1) throw new Error(`"${heading}" not found`)
  const end = r3.indexOf('\n### ', start + 1)
  const text = end === -1 ? r3.slice(start) : r3.slice(start, end)
  const rows = [...text.matchAll(/^\| (.+?) \| (.+?) \|$/gm)]
    .map((match) => [match[1].trim(), match[2].trim()] as const)
    // Drop the header row (the |---| row has no spaced cells).
    .slice(1)
  return new Map(rows)
}

const grouping = tableUnder('Grouping')
const unchanged = tableUnder('Unchanged')
const approved = tableUnder('New, approved by the owner')
const docGroups = [...grouping]
  .filter(([group]) => group !== 'How you can engage')
  .map(([heading, names]) => ({ heading, services: names.split('; ') }))
const docOffers = grouping.get('How you can engage')?.split('; ') ?? []

describe('Managed Services Regrouped plan §3 parser', () => {
  it('finds five grouping rows naming thirteen services', () => {
    expect(grouping.size).toBe(5)
    expect([...grouping.values()].flatMap((names) => names.split('; '))).toHaveLength(13)
  })
})

describe('managedServices regrouped strings', () => {
  it('groups the services as the Grouping table does, in order', () => {
    expect(managedServices.groups).toEqual(docGroups)
  })

  it('uses the "How you can engage" row as the offers', () => {
    expect(managedServices.offers).toEqual(docOffers)
  })

  it('uses the approved engagement label', () => {
    expect(managedServices.engagementLabel).toBe(approved.get('Engagement label'))
  })

  it('keeps the unchanged headline, paragraph, service link and journey steps', () => {
    expect(managedServices.sectionHeading).toBe(unchanged.get('Headline'))
    expect(managedServices.description).toBe(unchanged.get('Paragraph'))
    expect(managedServices.heading).toBe(unchanged.get('Service link'))
    expect(managedServices.journey).toEqual(unchanged.get('Journey steps')?.split(', '))
  })
})
