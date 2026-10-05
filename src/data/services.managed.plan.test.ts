// Checks the Managed Services section's own strings in services.ts against
// plan V2 (_docs/fafanua-v2-visual-upgrade-plan.md): the heading and the
// capability rail in Section 10, and the eyebrow label in Section 9's
// numbering. The approved proposition (eyebrow, heading, description,
// capabilities and journey) is checked against the positioning doc by
// services.plan.test.ts. The ?raw import resolves relative to this file
// and is never part of the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/fafanua-v2-visual-upgrade-plan.md?raw'
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

  it('uses the Section 10 capability rail, one word per item, in order', () => {
    expect(managedServices.rail).toEqual(docRail)
  })

  it('uses the label numbered 02 in Section 9 as the eyebrow label', () => {
    expect(docNumbering[1]).toEqual(['02', managedServices.sectionLabel])
  })
})
