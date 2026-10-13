// Checks positioning.ts against the V2 refinement plan §3, so the
// positioning section's wording on the site cannot drift from it: the
// problem is the left column's quote (#63). The response, the right
// column's quote, was removed by W3 in the trust and lineage plan (#70),
// so it is checked as absent from src/. The ?raw imports resolve relative
// to this file and are never part of the production bundle.
import { describe, expect, it } from 'vitest'
import refinement from '../../_docs/fafanua-v2-refinement-plan.md?raw'
import positioningSource from './positioning.ts?raw'
import * as positioning from './positioning.ts'
import { positioningProblem } from './positioning.ts'

const doc = refinement.replace(/\r\n/g, '\n')

// The text of §3, from its `# 3. ` heading up to the next `# ` heading.
const start = doc.indexOf('\n# 3. ')
const s3 = doc.slice(start, doc.indexOf('\n# ', start + 1))

// The one-line `> ` quotes under a `## ` heading, without bold markers.
function quotes(heading: string): string[] {
  const at = s3.indexOf(`\n## ${heading}\n`)
  if (at === -1) throw new Error(`"## ${heading}" not found`)
  const end = s3.indexOf('\n## ', at + 1)
  const text = end === -1 ? s3.slice(at) : s3.slice(at, end)
  return [...text.matchAll(/^> (.+)$/gm)].map((match) =>
    match[1].trimEnd().replace(/^\*\*(.+)\*\*$/, '$1'),
  )
}

const problem = quotes('Left column — The problem')
const response = quotes("Right column — Fafanua's response")

describe('refinement plan §3 parser', () => {
  it('finds one quote under each column heading', () => {
    expect(start).toBeGreaterThan(-1)
    expect(problem).toHaveLength(1)
    expect(response).toHaveLength(1)
    for (const quote of [...problem, ...response]) expect(quote).not.toContain('*')
  })
})

describe('positioning wording', () => {
  it('uses the left column\'s problem, character for character', () => {
    expect(positioningProblem).toBe(problem[0])
  })

  it('no longer exports the right column\'s response, or any copy but the problem (#70)', () => {
    expect(Object.keys(positioning)).toEqual(['positioningProblem'])
    expect(positioningSource).not.toContain(response[0])
    expect(response[0]).toContain(' — ')
  })
})

describe('positioning source', () => {
  // The module's code without its comments, which name the plan.
  const code = positioningSource.replace(/\/\/.*$/gm, '')

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })
})

describe('other source files', () => {
  // Every source file under src/ except positioning.ts and test files
  // (positioning.ts is checked above, and no longer holds the response).
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(([file]) => file !== '/src/data/positioning.ts' && !/\.test\.tsx?$/.test(file))

  it('scans the rest of src/', () => {
    expect(sources.map(([file]) => file)).toContain('/src/components/Positioning.tsx')
  })

  it.each([
    ['the problem', positioningProblem],
    // Removed by W3 in the trust and lineage plan (#70).
    ['the response', response[0]],
    // The two paragraphs the refinement replaced.
    ['the old statement', 'Fafanua helps organisations build reliable data foundations'],
    ['the old supporting copy', 'Fafanua helps East African businesses'],
  ])('do not hold %s', (_name, text) => {
    for (const [file, source] of sources) {
      expect(source.includes(text), `${file} holds "${text}"`).toBe(false)
    }
  })
})
