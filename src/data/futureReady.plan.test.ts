// Checks futureReady.ts against section C's copy table in the homepage
// sections refinement plan (§6, #91), so the future-ready section's
// wording on the site cannot drift from it: the lead, the four condition
// tiles in order, the goal tile, the verdict line, the three chips and the
// link. The keys are compared in upper case, as CSS shows them; the rest
// character for character. It also checks that W5 in the trust and
// lineage plan, whose copy section C supersedes, says so. The heading is
// plan V2 §14's, which section C keeps. The ?raw imports resolve relative
// to this file and are never part of the production bundle.
import { describe, expect, it } from 'vitest'
import { LANDING_COPY, occurrences, scanned as scannedWith, type Allowed } from '../test/landingCopy.ts'
import trustPlan from '../../_docs/fafanua-trust-lineage-positioning-plan.md?raw'
import refinementPlan from '../../_docs/fafanua-homepage-sections-refinement-plan.md?raw'
import futureReadySource from './futureReady.ts?raw'
import {
  futureReadyConditions,
  futureReadyGoal,
  futureReadyHeading,
  futureReadyLead,
  futureReadyLinkText,
  futureReadyVerdictLine,
  futureReadyVerdicts,
} from './futureReady.ts'

// Section C's copy table: each `| Element | Text | Status |` row, from
// `### Copy` up to `### Layout`.
const sectionsDoc = refinementPlan.replace(/\r\n/g, '\n')
const c6Start = sectionsDoc.indexOf('\n## 6. Section C: Trusted foundations for what comes next\n')
const c6Copy = sectionsDoc.slice(
  sectionsDoc.indexOf('\n### Copy\n', c6Start),
  sectionsDoc.indexOf('\n### Layout\n', c6Start),
)
const sectionC = new Map(
  [...c6Copy.matchAll(/^\| (.+?) \| (.+?) \| (.+?) \|$/gm)]
    .filter((row) => row[1] !== 'Element' && !/^-+$/.test(row[1]))
    .map((row) => [row[1], row[2]]),
)
const sectionCText = (element: string): string => {
  const text = sectionC.get(element)
  if (text === undefined) throw new Error(`No "${element}" row in section C`)
  return text
}
// A tile's `KEY / Text` cell.
const tile = (element: string) => {
  const [key, text] = sectionCText(element).split(' / ')
  return { key, text }
}

const trustDoc = trustPlan.replace(/\r\n/g, '\n')
const w5Start = trustDoc.indexOf('\n### W5. AI-readiness copy (in place)\n')
const w5 = trustDoc.slice(w5Start, trustDoc.indexOf('\n### ', w5Start + 1))

describe('section C parser', () => {
  it('finds section C\'s copy table with its ten rows', () => {
    expect(c6Start).toBeGreaterThan(-1)
    expect([...sectionC.keys()]).toEqual([
      'Heading',
      'Lead',
      'Tile 1',
      'Tile 2',
      'Tile 3',
      'Tile 4',
      'Goal tile',
      'Verdict line',
      'Verdict chips',
      'Link',
    ])
  })
})

describe('future-ready wording', () => {
  it('keeps the plan V2 §14 heading, which section C leaves unchanged', () => {
    expect(futureReadyHeading).toBe('Trusted foundations for what comes next')
    expect(futureReadyHeading).toBe(sectionCText('Heading'))
  })

  it('uses section C\'s lead, character for character', () => {
    expect(futureReadyLead).toBe(sectionCText('Lead'))
  })

  it('uses section C\'s four tiles, in order: keys in upper case, conditions exactly', () => {
    const tiles = ['Tile 1', 'Tile 2', 'Tile 3', 'Tile 4'].map(tile)
    expect(futureReadyConditions.map((condition) => condition.key.toUpperCase())).toEqual(
      tiles.map((planTile) => planTile.key),
    )
    expect(futureReadyConditions.map((condition) => condition.text)).toEqual(
      tiles.map((planTile) => planTile.text),
    )
  })

  it('holds the keys in sentence case, as the site\'s other eyebrow labels', () => {
    for (const { key } of [...futureReadyConditions, futureReadyGoal]) {
      expect(key).toBe(key.charAt(0) + key.slice(1).toLowerCase())
    }
  })

  it('uses section C\'s goal tile', () => {
    const goal = tile('Goal tile')
    expect(futureReadyGoal.key.toUpperCase()).toBe(goal.key)
    expect(futureReadyGoal.text).toBe(goal.text)
  })

  it('uses section C\'s verdict line and its three chips, in order', () => {
    expect(futureReadyVerdictLine).toBe(sectionCText('Verdict line'))
    expect(futureReadyVerdicts).toEqual(sectionCText('Verdict chips').split('; '))
  })

  it('uses section C\'s link text, without the "→" the component adds', () => {
    expect(`${futureReadyLinkText} →`).toBe(sectionCText('Link'))
  })

  it('uses none of the retired vocabulary (trust and lineage plan section 6)', () => {
    for (const text of [
      futureReadyHeading,
      futureReadyLead,
      ...futureReadyConditions.flatMap(({ key, text: condition }) => [key, condition]),
      futureReadyGoal.key,
      futureReadyGoal.text,
      futureReadyVerdictLine,
      ...futureReadyVerdicts,
      futureReadyLinkText,
    ]) {
      expect(text).not.toMatch(/provenance|data operating system|African organisations/i)
    }
  })
})

describe('W5 in the trust and lineage plan', () => {
  it('is marked superseded by section C (#91), and keeps its original text', () => {
    expect(w5Start).toBeGreaterThan(-1)
    expect(w5).toMatch(
      /^\*\*Superseded \(2026-10-23, #91\):\*\* W5's copy \(the paragraph and the list\) is superseded by section C of `_docs\/fafanua-homepage-sections-refinement-plan\.md`\./m,
    )
    expect(w5).toMatch(/^> AI and advanced analytics work only when three things are true/m)
    expect(w5).toContain('**Acceptance:**')
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

  it('holds no "→", which the component adds as aria-hidden text', () => {
    expect(code).not.toContain('→')
  })
})

// The one homepage string solutionPages.ts repeats here by design (#93):
// the Public Sector hero's secondary button, as a quoted literal, with the
// number of times it may occur there. Only it is taken out of that file
// before the scan below.
const LANDING_ALLOWED: Allowed = [["'See how the assessment works'", 1]]
const scanned = (file: string, source: string) => scannedWith(file, source, LANDING_ALLOWED)

describe('other source files', () => {
  // Every source file under src/ except futureReady.ts and test files.
  // solutionPages.ts is scanned without the homepage strings its Public
  // Sector entry repeats by design (#93, src/test/landingCopy.ts): the
  // hero's secondary button has the same words as this section's link.
  const sources = Object.entries(
    import.meta.glob<string>('/src/**/*.{ts,tsx,css,html}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  )
    .filter(([file]) => file !== '/src/data/futureReady.ts' && !/\.test\.tsx?$/.test(file))
    .map(([file, source]) => [file, scanned(file, source)] as const)

  it('scans the rest of src/, the landing pages\' copy included', () => {
    const files = sources.map(([file]) => file)
    expect(files).toContain('/src/components/FutureReady.tsx')
    expect(files).not.toContain('/src/data/futureReady.ts')
    expect(files).toContain(LANDING_COPY)
    expect(files).toContain('/src/data/solutions.ts')
    const raw = import.meta.glob<string>('/src/data/solutionPages.ts', { query: '?raw', import: 'default', eager: true })[LANDING_COPY]
    expect(LANDING_ALLOWED).toEqual([[`'${futureReadyLinkText}'`, 1]])
    for (const [literal, count] of LANDING_ALLOWED) expect(occurrences(raw, literal), literal).toBe(count)
    const stripped = sources.find(([file]) => file === LANDING_COPY)![1]
    expect(occurrences(stripped, futureReadyLinkText)).toBe(0)
  })

  it('do not repeat the heading, the lead, the verdict line or the link text', () => {
    for (const [file, source] of sources) {
      for (const text of [futureReadyHeading, futureReadyLead, futureReadyVerdictLine, futureReadyLinkText]) {
        expect(source.includes(text), `${file} repeats "${text}"`).toBe(false)
      }
    }
  })
})
