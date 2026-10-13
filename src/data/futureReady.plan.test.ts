// Checks futureReady.ts against W5 in the trust and lineage plan (#72), so
// the future-ready section's wording on the site cannot drift from it: the
// paragraph is W5's quote, and the graphic's four labels and destination
// are W5's list, in order. The heading is plan V2 §14's, which W5 keeps.
// The ?raw imports resolve relative to this file and are never part of the
// production bundle.
import { describe, expect, it } from 'vitest'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import futureReadySource from './futureReady.ts?raw'
import {
  futureReadyDestination,
  futureReadyHeading,
  futureReadyLabels,
  futureReadyStatement,
} from './futureReady.ts'

const doc = trustPlan.replace(/\r\n/g, '\n')

// W5, up to the next `### ` item.
const w5Start = doc.indexOf('\n### W5. AI-readiness copy (in place)\n')
const w5 = doc.slice(w5Start, doc.indexOf('\n### ', w5Start + 1))

// The one `> ` quote: the paragraph.
const quotes = [...w5.matchAll(/^> (.+)$/gm)].map((match) => match[1].trimEnd())

// "The list then reads: a, b, c, d, then e."
const listMatch = w5.match(/The list then reads: (.+), then (.+)\.$/m)
const listItems = listMatch ? listMatch[1].split(', ') : []
const listEnd = listMatch ? listMatch[2] : ''

describe('W5 parser', () => {
  it('finds W5, its one quote and its list', () => {
    expect(w5Start).toBeGreaterThan(-1)
    expect(quotes).toHaveLength(1)
    expect(listMatch).not.toBeNull()
    expect(listItems).toHaveLength(4)
    expect(listEnd).not.toBe('')
  })

  it('keeps the heading named in W5', () => {
    expect(w5).toContain(`"${futureReadyHeading}"`)
  })
})

describe('future-ready wording', () => {
  it('uses the W5 paragraph, character for character', () => {
    expect(futureReadyStatement).toBe(quotes[0])
  })

  it('uses the W5 list, in order: four labels, then the destination', () => {
    expect(futureReadyLabels).toEqual(listItems)
    expect(futureReadyDestination).toBe(listEnd)
  })

  it('swaps only "provenance" for "lineage" in the list', () => {
    expect(w5).toMatch(/replace "provenance" with "lineage"/)
    expect(futureReadyLabels).toEqual([
      'business definitions',
      'access controls',
      'quality signals',
      'lineage',
    ])
  })

  it('keeps the plan V2 §14 heading', () => {
    expect(futureReadyHeading).toBe('Trusted foundations for what comes next')
  })

  it('uses none of the retired vocabulary (plan section 6)', () => {
    for (const text of [futureReadyHeading, futureReadyStatement, ...futureReadyLabels, futureReadyDestination]) {
      expect(text).not.toMatch(/provenance|data operating system|African organisations/i)
    }
  })
})

describe('future-ready source', () => {
  // The module's code without its comments, which name the plans.
  const code = futureReadySource.replace(/\/\/.*$/gm, '')

  it('holds its strings as literals and does not read the plan', () => {
    expect(code).not.toMatch(/\bimport\b|\brequire\(|\bfetch\(|readFile|plan\.md/)
  })

  it('has no JSX, React, class names, colours or tokens', () => {
    expect(code).not.toMatch(/\breact\b|<\/|\/>|#[0-9a-f]{3}|rgb\(|hsl\(|var\(|--|className/i)
  })
})

describe('other source files', () => {
  // Every source file under src/ except futureReady.ts and test files.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).filter(
    ([file]) => file !== '/src/data/futureReady.ts' && !/\.test\.tsx?$/.test(file),
  )

  it('scans the rest of src/', () => {
    const files = sources.map(([file]) => file)
    expect(files).toContain('/src/components/FutureReady.tsx')
    expect(files).not.toContain('/src/data/futureReady.ts')
  })

  it('do not repeat the heading, the paragraph or the destination', () => {
    for (const [file, source] of sources) {
      for (const text of [futureReadyHeading, futureReadyStatement, futureReadyDestination]) {
        expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
      }
    }
  })
})
