// Checks solutions.ts against _docs/plan-fafanua-services-positioning.md
// Sections 15-19, which are authoritative for the Solutions copy, so the
// wording on the site cannot drift from it. The ?raw import resolves
// relative to this file and is never part of the production bundle.
import { describe, expect, it } from 'vitest'
import positioning from '../../_docs/plan-fafanua-services-positioning.md?raw'
import solutionsSource from './solutions.ts?raw'
import { solutions } from './solutions.ts'

type DocSolution = {
  number: string
  title: string
  themes: string[]
  clientTypes: string[]
}

const doc = positioning.replace(/\r\n/g, '\n')

// The text of top-level section `n`, from its `# n. ` heading up to the
// next `# ` heading.
function section(markdown: string, n: number): string {
  const start = markdown.indexOf(`\n# ${n}. `)
  if (start === -1) throw new Error(`Section ${n} not found`)
  const end = markdown.indexOf('\n# ', start + 1)
  return end === -1 ? markdown.slice(start) : markdown.slice(start, end)
}

// The `- ` bullets that follow a `label:` line, up to the next blank line
// that is not followed by another bullet.
function bulletsAfter(text: string, label: string): string[] {
  const start = text.indexOf(`\n${label}:\n`)
  if (start === -1) return []
  const rest = text.slice(start + label.length + 3).replace(/^\n+/, '')
  const block = rest.match(/^(?:- .+\n?)+/)?.[0] ?? ''
  return [...block.matchAll(/^- (.+)$/gm)].map((match) => match[1].trim())
}

// Sections 15-19: one solution each. The title is the `> **…**` line.
function parseSolution(markdown: string, n: number): DocSolution {
  const text = section(markdown, n)
  return {
    number: String(n),
    title: text.match(/^> \*\*(.+)\*\*$/m)?.[1].trim() ?? '',
    themes: bulletsAfter(text, 'Suggested themes'),
    clientTypes: bulletsAfter(text, 'Potential client types'),
  }
}

const docSolutions = [15, 16, 17, 18, 19].map((n) => parseSolution(doc, n))

describe('positioning doc parser', () => {
  it('finds five solutions with seven themes each in Sections 15 to 19', () => {
    expect(docSolutions.map((solution) => solution.title)).toEqual([
      'Financial Services',
      'Retail & Distribution',
      'Development & Impact',
      'Education',
      'Public Sector',
    ])
    expect(docSolutions.map((solution) => solution.themes.length)).toEqual([
      7, 7, 7, 7, 7,
    ])
  })

  it('finds client types for the first three sectors only', () => {
    expect(
      docSolutions.map((solution) => solution.clientTypes.length > 0),
    ).toEqual([true, true, true, false, false])
  })
})

describe('solutions wording', () => {
  it.each(docSolutions.map((solution, index) => [solution.number, index]))(
    'matches the title and themes in Section %s',
    (_number, index) => {
      const expected = docSolutions[index]
      const actual = solutions[index]

      expect(actual.title).toEqual(expected.title)
      expect(actual.themes).toEqual(expected.themes)
    },
  )

  it('has no more solutions than the doc', () => {
    expect(solutions).toHaveLength(docSolutions.length)
  })

  it('contains no "Potential client types" entry', () => {
    const code = solutionsSource.replace(/\/\/.*$/gm, '')
    for (const clientType of docSolutions.flatMap((solution) => solution.clientTypes)) {
      expect(code.includes(clientType), `solutions.ts has "${clientType}"`).toBe(false)
    }
  })
})
