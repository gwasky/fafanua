// Checks positioning.ts against its plans, so the problem block's wording
// on the site cannot drift from them: the problem is the V2 refinement
// plan §3's left column quote (#63). The response, its right column's
// quote, was removed by W3 in the trust and lineage plan (#70), so it is
// checked as absent from src/. The eyebrow and framing are the homepage
// enhancement plan §5's left column, and the
// transition its §6 (#79). The ?raw imports resolve relative to this file
// and are never part of the production bundle.
import { describe, expect, it } from 'vitest'
import enhancement from '../../_docs/fafanua-data-trust-assessment-homepage-enhancement.md?raw'
import refinement from '../../_docs/fafanua-v2-refinement-plan.md?raw'
import positioningSource from './positioning.ts?raw'
import * as positioning from './positioning.ts'
import {
  positioningEyebrow,
  positioningFraming,
  positioningProblem,
  positioningProblemChallenge,
  positioningProblemLead,
  positioningTransition,
} from './positioning.ts'

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

// The enhancement plan (#79): the text of a `# N. ` section, up to the
// next `# ` heading, and its one-line `> ` quotes, without bold markers,
// optionally only those under one `## ` heading.
const enhancementDoc = enhancement.replace(/\r\n/g, '\n')

function enhancementSection(number: number): string {
  const at = enhancementDoc.indexOf(`\n# ${number}. `)
  if (at === -1) throw new Error(`"# ${number}. " not found`)
  return enhancementDoc.slice(at, enhancementDoc.indexOf('\n# ', at + 1))
}

function enhancementQuotes(number: number, heading?: string): string[] {
  let text = enhancementSection(number)
  if (heading !== undefined) {
    const at = text.indexOf(`\n## ${heading}\n`)
    if (at === -1) throw new Error(`"## ${heading}" not found in §${number}`)
    const end = text.indexOf('\n## ', at + 1)
    text = end === -1 ? text.slice(at) : text.slice(at, end)
  }
  return [...text.matchAll(/^> (.+)$/gm)].map((match) =>
    match[1].trimEnd().replace(/^\*\*(.+)\*\*$/, '$1'),
  )
}

const leftColumn = enhancementQuotes(5, 'Left column')
const rightColumn = enhancementQuotes(5, 'Right column')
const transition = enhancementQuotes(6)

describe('refinement plan §3 parser', () => {
  it('finds one quote under each column heading', () => {
    expect(start).toBeGreaterThan(-1)
    expect(problem).toHaveLength(1)
    expect(response).toHaveLength(1)
    for (const quote of [...problem, ...response]) expect(quote).not.toContain('*')
  })
})

describe('enhancement plan §5 and §6 parser (#79)', () => {
  it('finds the eyebrow and framing under the left column, the statement under the right, and the transition', () => {
    expect(leftColumn).toHaveLength(2)
    expect(rightColumn).toHaveLength(1)
    expect(transition).toHaveLength(1)
    for (const quote of [...leftColumn, ...rightColumn, ...transition]) {
      expect(quote).not.toBe('')
      expect(quote).not.toContain('*')
    }
  })
})

describe('positioning wording', () => {
  it('uses the left column\'s problem, character for character', () => {
    expect(positioningProblem).toBe(problem[0])
  })

  it('keeps the problem as the enhancement plan\'s right column statement (#79)', () => {
    expect(positioningProblem).toBe(rightColumn[0])
  })

  it('uses the enhancement plan §5\'s eyebrow, shown in capitals (#79)', () => {
    expect(leftColumn[0]).toBe('THE PROBLEM')
    expect(positioningEyebrow).toBe('The problem')
    expect(positioningEyebrow.toUpperCase()).toBe(leftColumn[0])
  })

  it('uses the enhancement plan §5\'s framing line, character for character (#79)', () => {
    expect(positioningFraming).toBe(leftColumn[1])
    expect(positioningFraming).toBe(
      'Organisations rarely lack data. The challenge is knowing whether the numbers used to run the business are connected, consistent and trustworthy.',
    )
  })

  it('uses the enhancement plan §6\'s transition, character for character (#79)', () => {
    expect(positioningTransition).toBe(transition[0])
    expect(positioningTransition).toBe(
      'That is why Fafanua starts by tracing the numbers leadership relies on most back to their source.',
    )
  })

  it('keeps the problem as its lead and challenge joined by exactly one space (#80)', () => {
    expect(positioningProblem).toBe(`${positioningProblemLead} ${positioningProblemChallenge}`)
    expect(positioningProblemLead).toBe(
      'Most organisations already have data, reporting and operational systems.',
    )
    expect(positioningProblemChallenge).toBe(
      'The challenge is making the information flowing through them connected, consistent and trusted.',
    )
    expect(problem[0]).toBe(`${positioningProblemLead} ${positioningProblemChallenge}`)
    for (const half of [positioningProblemLead, positioningProblemChallenge]) {
      expect(half).toBe(half.trim())
      expect(half).not.toMatch(/\s{2}/)
    }
  })

  it('exports exactly the eyebrow, framing, problem, its two sentences and transition, and not the right column\'s response (#70, #79, #80)', () => {
    expect(Object.keys(positioning)).toEqual([
      'positioningEyebrow',
      'positioningFraming',
      'positioningProblemLead',
      'positioningProblemChallenge',
      'positioningProblem',
      'positioningTransition',
    ])
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

  it('holds the statement\'s two sentences as literals (#80)', () => {
    expect(code).toContain(`export const positioningProblemLead =\n  '${positioningProblemLead}'`)
    expect(code).toContain(`export const positioningProblemChallenge =\n  '${positioningProblemChallenge}'`)
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
    // Its two sentences, the statement's two tones (W10, #80).
    ['the problem\'s first sentence', positioningProblemLead],
    ['the problem\'s second sentence', positioningProblemChallenge],
    // The eyebrow as a string literal: the words also name the block in
    // comments.
    ['the eyebrow', `'${positioningEyebrow}'`],
    ['the framing', positioningFraming],
    ['the transition', positioningTransition],
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
