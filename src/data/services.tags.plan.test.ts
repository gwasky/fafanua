// Checks each service's capability tags in services.ts against the lists
// under "Capability tags" in plan V2 Section 9
// (_docs/fafanua-v2-visual-upgrade-plan.md), the same way
// services.plan.test.ts checks the service copy against the positioning
// doc. The ?raw import resolves relative to this file and is never part of
// the production bundle.
import { describe, expect, it } from 'vitest'
import plan from '../../_docs/fafanua-v2-visual-upgrade-plan.md?raw'
import { services } from './services.ts'

const doc = plan.replace(/\r\n/g, '\n')

// The text of top-level section `n`, from its `# n. ` heading up to the
// next `# ` heading.
function section(markdown: string, n: number): string {
  const start = markdown.indexOf(`\n# ${n}. `)
  if (start === -1) throw new Error(`Section ${n} not found`)
  const end = markdown.indexOf('\n# ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// Section 9's "### Capability tags" subsection: each `**Service name**`
// line followed by its `- ` bullets, in document order.
function parseTags(markdown: string): [string, string[]][] {
  const text = section(markdown, 9)
  const start = text.indexOf('\n### Capability tags')
  if (start === -1) throw new Error('Capability tags not found')
  const end = text.indexOf('\n## ', start + 1)
  const block = end === -1 ? text.slice(start) : text.slice(start, end)
  const groups = [...block.matchAll(/^\*\*(.+)\*\*\n((?:- .+\n?)+)/gm)]
  return groups.map((group): [string, string[]] => [
    group[1].trim(),
    [...group[2].matchAll(/^- (.+)$/gm)].map((match) => match[1].trim()),
  ])
}

const docTags = parseTags(doc)

describe('plan V2 capability tags parser', () => {
  it('finds six tag lists of 3 to 5 tags in Section 9', () => {
    expect(docTags).toHaveLength(6)
    for (const [name, tags] of docTags) {
      expect(name).not.toBe('')
      expect(tags.length, name).toBeGreaterThanOrEqual(3)
      expect(tags.length, name).toBeLessThanOrEqual(5)
    }
  })
})

describe('services tags', () => {
  it('lists the plan V2 tag groups under the service names, in service order', () => {
    expect(docTags.map(([name]) => name)).toEqual(
      services.map((service) => service.name),
    )
  })

  it.each(docTags.map(([name], index) => [name, index]))(
    'matches the tags for %s, in plan order',
    (_name, index) => {
      expect(services[index].tags).toEqual(docTags[index][1])
    },
  )
})
